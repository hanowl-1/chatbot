from http.server import HTTPServer, BaseHTTPRequestHandler
import json

class CORSRequestHandler(BaseHTTPRequestHandler):
    def _set_headers(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', 'http://localhost:3000')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_OPTIONS(self):
        self._set_headers()

    def do_GET(self):
        if self.path == '/':
            self._set_headers()
            response = {"message": "SuperMembers Chatbot Tester API", "version": "1.0.0"}
            self.wfile.write(json.dumps(response).encode())
        elif self.path == '/api/faq-data':
            self._set_headers()
            with open('../data/processed_qna.json', 'r', encoding='utf-8') as f:
                faq_data = json.load(f)
            response = {"data": faq_data, "count": sum(len(v) for v in faq_data.values())}
            self.wfile.write(json.dumps(response, ensure_ascii=False).encode())

    def do_POST(self):
        if self.path == '/api/chat':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            # 간단한 모의 응답
            response = {
                "model": data.get("model", "gpt-4"),
                "response": "죄송합니다. 현재 AI 모델이 연결되지 않았습니다. 테스트 응답입니다.",
                "tokens_used": 50,
                "response_time": 0.5,
                "cost": 0.001,
                "timestamp": "2024-01-01T00:00:00"
            }
            
            self._set_headers()
            self.wfile.write(json.dumps(response).encode())

def run_server(port=8000):
    server_address = ('', port)
    httpd = HTTPServer(server_address, CORSRequestHandler)
    print(f'서버가 포트 {port}에서 실행 중입니다...')
    print(f'http://localhost:{port} 에서 확인하세요')
    httpd.serve_forever()

if __name__ == '__main__':
    run_server()