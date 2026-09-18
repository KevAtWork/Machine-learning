import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.app.main import app
from backend.app.database import Base, get_db
from backend.app.config import settings

# Create a clean, isolated in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="module")
def db_session():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="module")
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
            
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()

def test_user_registration(client):
    """Test registering a new clinical user account."""
    response = client.post(
        f"{settings.API_V1_STR}/auth/register",
        json={
            "email": "testdoc@clinical.com",
            "password": "securepassword123",
            "full_name": "Dr. Test Practitioner"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "testdoc@clinical.com"
    assert "id" in data
    assert "hashed_password" not in data

def test_duplicate_registration_fails(client):
    """Test registering duplicate accounts fails with 400."""
    # Attempt register again
    response = client.post(
        f"{settings.API_V1_STR}/auth/register",
        json={
            "email": "testdoc@clinical.com",
            "password": "differentpwd123",
            "full_name": "Dr. Same Email"
        }
    )
    assert response.status_code == 400
    assert "already registered" in response.json()["detail"]

def test_user_login(client):
    """Test authenticating credentials and receiving signed token keys."""
    response = client.post(
        f"{settings.API_V1_STR}/auth/login",
        json={
            "email": "testdoc@clinical.com",
            "password": "securepassword123"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "testdoc@clinical.com"

def test_login_invalid_credentials(client):
    """Test login with wrong passwords fails with 400."""
    response = client.post(
        f"{settings.API_V1_STR}/auth/login",
        json={
            "email": "testdoc@clinical.com",
            "password": "wrongpassword"
        }
    )
    assert response.status_code == 400
    assert "Incorrect email" in response.json()["detail"]

def test_get_current_user_profile(client):
    """Test retrieving user details via Bearer JWT header validation."""
    # First, acquire token
    login_res = client.post(
        f"{settings.API_V1_STR}/auth/login",
        json={
            "email": "testdoc@clinical.com",
            "password": "securepassword123"
        }
    )
    token = login_res.json()["access_token"]
    
    # Query Profile
    response = client.get(
        f"{settings.API_V1_STR}/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert response.json()["email"] == "testdoc@clinical.com"
