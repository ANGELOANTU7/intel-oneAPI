import uvicorn
from fastapi import FastAPI
from Backend.pyqsorter import router as api1_router
# import other API routers as needed

app = FastAPI()

# Mount the API routers
app.include_router(api1_router)
# include other API routers as needed

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)