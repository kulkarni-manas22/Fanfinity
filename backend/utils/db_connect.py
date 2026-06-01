import psycopg2
import psycopg2.extras
from config import DB_CONFIG

def get_connection():
    """Return a new PostgreSQL connection."""
    return psycopg2.connect(**DB_CONFIG)

def query(sql, params=None, fetch="all"):
    """
    Run a SELECT query and return results as list of dicts.
    fetch = "all" | "one" | None (for INSERT/UPDATE/DELETE)
    """
    conn = get_connection()
    try:
        with conn:
            with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
                cur.execute(sql, params or ())
                if fetch == "all":
                    return [dict(row) for row in cur.fetchall()]
                elif fetch == "one":
                    row = cur.fetchone()
                    return dict(row) if row else None
                else:
                    return None
    finally:
        conn.close()

def execute(sql, params=None, returning=False):
    """
    Run INSERT / UPDATE / DELETE.
    If returning=True, returns the first row (for RETURNING clauses).
    """
    conn = get_connection()
    try:
        with conn:
            with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
                cur.execute(sql, params or ())
                if returning:
                    row = cur.fetchone()
                    return dict(row) if row else None
                return None
    finally:
        conn.close()
