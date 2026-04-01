from fastapi import FastAPI
from src.routes.resume_routes import router as resume_router

app = FastAPI(title="CV Ranker API")

app.include_router(resume_router, prefix="/resumes", tags=["Resumes"])


@app.get("/")
def root():
    return {"message": "CV Ranker API running "}