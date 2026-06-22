import asyncio
import logging
import socket
import subprocess
import sys
from pathlib import Path
from urllib.parse import urlparse

from chatterbox.infrastructure.config.settings import Settings

logger = logging.getLogger(__name__)

_LOCAL_HOSTS = frozenset({"localhost", "127.0.0.1", "::1"})
_MONGOD_PORT = 27017


def _api_root() -> Path:
    return Path(__file__).resolve().parents[4]


def is_local_mongodb(uri: str) -> bool:
    parsed = urlparse(uri)
    host = (parsed.hostname or "localhost").lower()
    port = parsed.port or _MONGOD_PORT
    return host in _LOCAL_HOSTS and port == _MONGOD_PORT


def is_mongodb_reachable(host: str = "127.0.0.1", port: int = _MONGOD_PORT, timeout: float = 1.0) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.settimeout(timeout)
        return sock.connect_ex((host, port)) == 0


def _find_mongod() -> Path | None:
    api_root = _api_root()
    candidates: list[Path] = [
        api_root / "tools" / "mongodb" / "bin" / "mongod.exe",
        api_root / "tools" / "mongodb" / "bin" / "mongod",
    ]

    if sys.platform == "win32":
        program_files = Path(r"C:\Program Files\MongoDB\Server")
        if program_files.is_dir():
            for server_dir in sorted(program_files.iterdir(), reverse=True):
                candidate = server_dir / "bin" / "mongod.exe"
                candidates.append(candidate)

    which_mongod = _which("mongod")
    if which_mongod:
        candidates.append(Path(which_mongod))

    seen: set[Path] = set()
    for candidate in candidates:
        resolved = candidate.resolve()
        if resolved in seen or not resolved.is_file():
            continue
        seen.add(resolved)
        if _mongod_works(resolved):
            return resolved

    return None


def _which(command: str) -> str | None:
    from shutil import which

    return which(command)


def _mongod_works(mongod_path: Path) -> bool:
    try:
        result = subprocess.run(
            [str(mongod_path), "--version"],
            capture_output=True,
            timeout=10,
            check=False,
            creationflags=subprocess.CREATE_NO_WINDOW if sys.platform == "win32" else 0,
        )
    except (OSError, subprocess.TimeoutExpired):
        return False
    return result.returncode == 0


def _start_mongod(mongod_path: Path) -> subprocess.Popen[bytes]:
    api_root = _api_root()
    data_dir = api_root / "data" / "db"
    data_dir.mkdir(parents=True, exist_ok=True)

    creation_flags = 0
    if sys.platform == "win32":
        creation_flags = subprocess.CREATE_NO_WINDOW | subprocess.CREATE_NEW_PROCESS_GROUP

    logger.info("Iniciando MongoDB local (%s) em %s", mongod_path, data_dir)
    return subprocess.Popen(
        [
            str(mongod_path),
            "--dbpath",
            str(data_dir),
            "--port",
            str(_MONGOD_PORT),
            "--bind_ip",
            "127.0.0.1",
        ],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        creationflags=creation_flags,
    )


async def ensure_local_mongodb_running(settings: Settings) -> None:
    if not settings.mongodb_auto_start or not is_local_mongodb(settings.mongodb_uri):
        return

    if is_mongodb_reachable():
        return

    mongod_path = _find_mongod()
    if mongod_path is None:
        raise RuntimeError(
            "MongoDB nao esta rodando em localhost:27017 e nenhum mongod foi encontrado. "
            "Execute .\\scripts\\start-mongodb.ps1, use Docker (docker compose up mongodb -d) "
            "ou configure MONGODB_URI para um servidor remoto (ex.: Atlas)."
        )

    process = _start_mongod(mongod_path)

    for _ in range(30):
        if is_mongodb_reachable():
            return
        if process.poll() is not None:
            raise RuntimeError(
                f"MongoDB encerrou inesperadamente (codigo {process.returncode}). "
                "Verifique data/db ou execute .\\scripts\\start-mongodb.ps1 manualmente."
            )
        await asyncio.sleep(1)

    process.terminate()
    raise RuntimeError(
        "MongoDB local nao respondeu apos 30s. "
        "Execute .\\scripts\\start-mongodb.ps1 em outro terminal para ver os logs."
    )
