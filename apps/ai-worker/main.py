from fastapi import FastAPI

app = FastAPI(title="Chronos AI Worker")


@app.get("/health")
def health():
    return {"status": "ok"}
