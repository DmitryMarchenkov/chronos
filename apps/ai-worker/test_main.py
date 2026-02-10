import unittest
import sys
from types import ModuleType

if 'fastapi' not in sys.modules:
    fastapi_stub = ModuleType('fastapi')

    class FastAPI:  # pragma: no cover - tiny CI stub
        def __init__(self, *args, **kwargs):
            del args, kwargs

        def get(self, _path):
            def decorator(func):
                return func

            return decorator

    fastapi_stub.FastAPI = FastAPI
    sys.modules['fastapi'] = fastapi_stub

from main import health


class HealthTestCase(unittest.TestCase):
    def test_health_returns_ok(self):
        self.assertEqual(health(), {"status": "ok"})


if __name__ == "__main__":
    unittest.main()
