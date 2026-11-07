import os
import uvicorn
from app import create_app
if __name__ == '__main__':
    uvicorn.run(create_app(), host='0.0.0.0', port=int(os.environ.get('PORT', '8000')),
                access_log=False, limit_concurrency=16, timeout_keep_alive=5)
