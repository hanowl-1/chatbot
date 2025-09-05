const XLSX = require('xlsx');
const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function downloadFile(url) {
  console.log(`Downloading file from: ${url}`);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download file: ${response.status}`);
  }
  
  // Gist에서 base64 문자열로 저장된 파일 다운로드
  const base64Content = await response.text();
  
  // base64를 Buffer로 변환
  const buffer = Buffer.from(base64Content, 'base64');
  
  // ArrayBuffer로 변환
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
}

async function uploadToRAG(chunk, chunkIndex) {
  try {
    // 청크를 Excel 파일로 변환
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(chunk);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    
    // Buffer로 변환
    const xlsxBuffer = XLSX.write(workbook, {
      type: 'buffer',
      bookType: 'xlsx',
    });
    
    // FormData 생성
    const formData = new FormData();
    formData.append('file', xlsxBuffer, `chunk_${chunkIndex + 1}.xlsx`);
    
    // RAG API 호출
    const response = await fetch(`${process.env.RAG_API_URL}/qa/bulk-upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RAG_MASTER_TOKEN}`,
        ...formData.getHeaders()
      },
      body: formData
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Chunk ${chunkIndex + 1} failed: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log(`Chunk ${chunkIndex + 1} uploaded successfully`);
    return { success: true, data };
  } catch (error) {
    console.error(`Chunk ${chunkIndex + 1} error:`, error.message);
    return { success: false, error: error.message };
  }
}

async function processExcel() {
  const fileUrl = process.env.FILE_URL;
  const fileName = process.env.FILE_NAME || 'upload.xlsx';
  const jobId = process.env.JOB_ID;
  
  const results = {
    jobId,
    fileName,
    startTime: new Date().toISOString(),
    status: 'processing',
    totalRows: 0,
    totalChunks: 0,
    successCount: 0,
    failCount: 0,
    chunks: []
  };
  
  try {
    // 1. 파일 다운로드
    console.log('Step 1: Downloading file...');
    const buffer = await downloadFile(fileUrl);
    
    // 2. Excel 파싱
    console.log('Step 2: Parsing Excel...');
    const workbook = XLSX.read(buffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    
    console.log(`Total rows: ${jsonData.length}`);
    results.totalRows = jsonData.length;
    
    // 3. 30개씩 청킹
    console.log('Step 3: Creating chunks...');
    const chunkSize = 30;
    const chunks = [];
    for (let i = 0; i < jsonData.length; i += chunkSize) {
      chunks.push(jsonData.slice(i, i + chunkSize));
    }
    
    console.log(`Total chunks: ${chunks.length}`);
    results.totalChunks = chunks.length;
    
    // 4. 각 청크 처리
    console.log('Step 4: Processing chunks...');
    for (let i = 0; i < chunks.length; i++) {
      console.log(`Processing chunk ${i + 1}/${chunks.length}...`);
      
      const result = await uploadToRAG(chunks[i], i);
      
      if (result.success) {
        results.successCount += chunks[i].length;
      } else {
        results.failCount += chunks[i].length;
      }
      
      results.chunks.push({
        index: i + 1,
        rows: chunks[i].length,
        ...result
      });
      
      // 서버 과부하 방지를 위한 딜레이
      if (i < chunks.length - 1) {
        console.log('Waiting 3 seconds before next chunk...');
        await sleep(3000);
      }
    }
    
    results.status = results.failCount === 0 ? 'completed' : 'completed_with_errors';
    results.endTime = new Date().toISOString();
    
    console.log(`\nProcessing completed!`);
    console.log(`Success: ${results.successCount} rows`);
    console.log(`Failed: ${results.failCount} rows`);
    
  } catch (error) {
    console.error('Fatal error:', error);
    results.status = 'failed';
    results.error = error.message;
    results.endTime = new Date().toISOString();
  }
  
  // 결과를 파일로 저장 (GitHub Actions artifact로 업로드됨)
  fs.writeFileSync('process-results.json', JSON.stringify(results, null, 2));
  console.log('\nResults saved to process-results.json');
  
  // GitHub Issue에 결과 댓글 추가 (선택사항)
  if (process.env.GITHUB_TOKEN && process.env.GITHUB_REPOSITORY) {
    try {
      const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/');
      const issueComment = `
## Excel Upload Processing Results

- **Job ID**: ${jobId}
- **File**: ${fileName}
- **Status**: ${results.status}
- **Total Rows**: ${results.totalRows}
- **Success**: ${results.successCount} rows
- **Failed**: ${results.failCount} rows
- **Processing Time**: ${new Date(results.endTime) - new Date(results.startTime)}ms

[View full results](https://github.com/${owner}/${repo}/actions/runs/${process.env.GITHUB_RUN_ID})
`;
      
      // 이슈 생성 또는 댓글 추가 로직
      console.log('Results summary:', issueComment);
    } catch (error) {
      console.error('Failed to post results:', error);
    }
  }
}

// 실행
processExcel().catch(error => {
  console.error('Process failed:', error);
  process.exit(1);
});