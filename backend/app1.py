from flask import Flask, request, jsonify, session, send_from_directory
from flask_cors import CORS
import os
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
import json
from datetime import datetime, timedelta
from functools import wraps
from psycopg2.extras import RealDictCursor
import random
import psycopg2
from psycopg2.extras import RealDictCursor
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv
load_dotenv()

from config import DB_CONFIG

# ============================================================
# APP SETUP
# ============================================================

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

app = Flask(__name__, static_folder=PROJECT_ROOT, static_url_path="")

app.secret_key = os.environ.get("SECRET_KEY", "fanfinity-dev-secret-key")
# CORS(app, supports_credentials=True)
CORS(
    app,
    supports_credentials=True,
    origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500",
        "http://127.0.0.1:5000",
        "http://localhost:5000"
    ]
)

app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
app.config["SESSION_COOKIE_HTTPONLY"] = True

VALID_CATEGORIES = [
    "anime", "games", "kpop", "movies", "series", "music", "pop", "movies&series"
]

CATEGORY_MAP = {
    "anime": 1,
    "games": 2,
    "movies": 4,
    "series": 5,
    "kpop": 6,
    "pop": 7,
}

CATEGORY_NAME_BY_ID = {
    1: "anime",
    2: "games",
    4: "movies",
    5: "series",
    6: "kpop",
    7: "pop",
}

UPLOAD_FOLDER = os.path.join(PROJECT_ROOT, "images", "products", "admin_uploads")
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "webp"}

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# ============================================================
# SERVE FRONTEND PAGES
# ============================================================

@app.route("/")
def root():
    return send_from_directory(PROJECT_ROOT, "loading.html")

@app.route("/home")
def home():
    return send_from_directory(PROJECT_ROOT, "home.html")

@app.route("/<page>.html")
def root_pages(page):
    return send_from_directory(PROJECT_ROOT, f"{page}.html")

@app.route("/category/<page>.html")
def category_pages(page):
    return send_from_directory(os.path.join(PROJECT_ROOT, "category"), f"{page}.html")

@app.route("/Admin/<page>.html")
def admin_pages(page):
    return send_from_directory(os.path.join(PROJECT_ROOT, "Admin"), f"{page}.html")


# ============================================================
# IN-MEMORY STORES  (replace with DB when ready)
# ============================================================

# users     = []
# orders    = []
# wishlists = {}   # { email: [product_id, ...] }
# carts     = {}   # { email: [{product_id, quantity}, ...] }


# ============================================================
# DB HELPERS
# ============================================================

def get_db_connection():
    return psycopg2.connect(**DB_CONFIG)

def parse_specifications(value):
    if value is None:
        return {}

    if isinstance(value, dict):
        return value

    if not isinstance(value, str):
        return {}

    value = value.strip()
    if not value:
        return {}

    # Try JSON first
    try:
        return json.loads(value)
    except Exception:
        pass

    # Convert plain text like:
    # "Material: X | Size: Y | Handles: Z"
    # into two frontend-friendly sections
    parts = [p.strip() for p in value.split("|") if p.strip()]

    grouped = {
        "Product Details": {},
        "Material & Build": {}
    }

    material_keywords = {
        "material", "finish", "body", "fabric", "paper", "wood", "metal",
        "plastic", "shell", "cover", "base", "print", "coating", "handle",
        "lid", "outer", "fill"
    }

    for part in parts:
        if ":" in part:
            key, val = part.split(":", 1)
            key = key.strip()
            val = val.strip()

            if key.lower() in material_keywords:
                grouped["Material & Build"][key] = val
            else:
                grouped["Product Details"][key] = val
        else:
            grouped["Product Details"][part] = ""

    # Remove empty sections
    grouped = {k: v for k, v in grouped.items() if v}
    return grouped
def format_product(row):
    if not row:
        return None

    return {
        "id": row["product_id"],
        "name": row["product_name"],
        "price": float(row["price"]) if row["price"] is not None else 0,
        "old_price": float(row["mrp"]) if row["mrp"] is not None else 0,
        "rating": float(row["rating"]) if row["rating"] is not None else 0,
        "rating_count": row["reviews"] if row["reviews"] is not None else 0,
        "image": row["image_link"] or "",
        "category": CATEGORY_NAME_BY_ID.get(row["category_id"], ""),
        "description": row["description"] or "",
        "stock": row["stock"] if row["stock"] is not None else 0,
        "specifications": parse_specifications(row["specifications"]),
        "ideal_for": row["ideal_for"] or "",
        "keywords": row["key_words"] or "",
        "is_new": bool(row["is_new"]),
        "is_popular": bool(row["is_popular"]),
        "is_recommended": bool(row["is_recommended"]),
        "show_on_home": bool(row["show_on_home"]),
    }

def fetch_products(query, params=None, one=False):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(query, params or ())
    result = cur.fetchone() if one else cur.fetchall()
    cur.close()
    conn.close()
    return result

def find_product(product_id: int):
    row = fetch_products(
        "SELECT * FROM products WHERE product_id = %s",
        (product_id,),
        one=True
    )
    return format_product(row)


def auto_complete_returns():
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        UPDATE returns
        SET
            status = 'RETURNED',
            returned_date = CURRENT_TIMESTAMP
        WHERE status = 'IN_RETURNING_PROCESS'
          AND request_date <= NOW() - INTERVAL '3 days'
    """)

    conn.commit()

    cur.close()
    conn.close()

# ============================================================
# HELPERS
# ============================================================

def generate_otp():
    return str(random.randint(100000, 999999))


def send_otp_email(to_email, otp_code):
    # Replace this later with actual SMTP / Flask-Mail logic
    print(f"OTP for {to_email}: {otp_code}")
    return True


def get_user_by_email(email: str):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT
            user_id,
            username,
            email,
            password,
            phone_no,
            address,
            city,
            state,
            country,
            pincode,
            role,
            joined_on
        FROM users
        WHERE email = %s
    """, (email,))

    user = cur.fetchone()
    cur.close()
    conn.close()
    return user


def get_user_by_id(user_id: int):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT
            user_id,
            username,
            email,
            password,
            phone_no,
            address,
            city,
            state,
            country,
            pincode,
            role,
            joined_on
        FROM users
        WHERE user_id = %s
    """, (user_id,))

    user = cur.fetchone()
    cur.close()
    conn.close()
    return user


def get_user_by_username(username: str):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT
            user_id,
            username,
            email,
            password,
            phone_no,
            address,
            city,
            state,
            country,
            pincode,
            role,
            joined_on
        FROM users
        WHERE username = %s
    """, (username,))

    user = cur.fetchone()
    cur.close()
    conn.close()
    return user


def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if "user_id" not in session:
            return jsonify({"error": "Login required"}), 401
        return f(*args, **kwargs)
    return decorated

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


# def hash_password(password: str) -> str:
#     return hashlib.sha256(password.encode()).hexdigest()

# def find_user(email: str):
#     return next((u for u in users if u["email"] == email), None)

# def login_required(f):
#     @wraps(f)
#     def decorated(*args, **kwargs):
#         if "user_email" not in session:
#             return jsonify({"error": "Login required"}), 401
#         return f(*args, **kwargs)
#     return decorated


#---------------------------------------------------------------------- Email sends on the registered email of user -----------------------------------------------------------------------------

def send_order_receipt_email(to_email, customer_name, order_code, items, subtotal, gst, total, payment_method, delivery_date):
    try:
        sender_email = os.environ.get("FANFINITY_SMTP_EMAIL")
        sender_password = os.environ.get("FANFINITY_SMTP_APP_PASSWORD")

        # print("EMAIL:", sender_email)
        # print("PASSWORD:", sender_password)

        if not sender_email or not sender_password:
            print("EMAIL ERROR: SMTP credentials missing")
            return False

        subject = f"Fanfinity Receipt - {order_code}"

        item_rows = ""
        for item in items:
            item_rows += f"""
            <tr>
                <td style="padding:10px;border-bottom:1px solid #eee;">{item['product_name']}</td>
                <td style="padding:10px;border-bottom:1px solid #eee;text-align:center;">{item['quantity']}</td>
                <td style="padding:10px;border-bottom:1px solid #eee;text-align:right;">₹{float(item['price']):,.2f}</td>
            </tr>
            """

        html_body = f"""
        <html>
        <body style="margin:0;padding:0;background:#fdfdf8;font-family:Arial,sans-serif;">
            <div style="max-width:700px;margin:30px auto;background:#ffffff;border:1px solid #f0d4b0;border-radius:18px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,0.12);">
                
                <div style="background:linear-gradient(to right, #ff4b2b, #ff8c42);padding:24px;text-align:center;color:white;">
                    <h1 style="margin:0;font-size:28px;">Fanfinity</h1>
                    <p style="margin:8px 0 0 0;font-size:15px;">Your order receipt</p>
                </div>

                <div style="padding:28px;">
                    <p style="font-size:16px;margin:0 0 14px 0;">Hi {customer_name or 'Customer'},</p>
                    <p style="font-size:15px;color:#444;line-height:1.6;">
                        Thank you for shopping with <strong>Fanfinity</strong>. Your order has been placed successfully.
                    </p>

                    <div style="background:#fff6ed;border:1px solid #ffd4aa;border-radius:14px;padding:18px;margin:22px 0;">
                        <p style="margin:0 0 8px 0;"><strong>Order ID: </strong> {order_code}</p>
                        <p style="margin:0 0 8px 0;"><strong>Payment Method: </strong> {payment_method.upper()}</p>
                        <p style="margin:0;"><strong>Estimated Delivery: </strong> {delivery_date.strftime('%d %b %Y')}</p>
                    </div>

                    <table style="width:100%;border-collapse:collapse;margin-top:10px;background:#fff;">
                        <thead>
                            <tr style="background:#f7e2b6;">
                                <th style="padding:12px;text-align:left;">Product</th>
                                <th style="padding:12px;text-align:center;">Qty</th>
                                <th style="padding:12px;text-align:right;">Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            {item_rows}
                        </tbody>
                    </table>

                    <div style="margin-top:24px;background:#f9f9f9;border-radius:14px;padding:18px;">
                        <p style="margin:0 0 10px 0;display:flex;justify-content:space-between;">
                            <span>Items Total: </span>
                            <strong>₹ {subtotal:,.2f}</strong>
                        </p>
                        <p style="margin:0 0 10px 0;display:flex;justify-content:space-between;">
                            <span>GST (18%): </span>
                            <strong>₹ {gst:,.2f}</strong>
                        </p>
                        <hr style="border:none;border-top:1px solid #ddd;margin:14px 0;">
                        <p style="margin:0;display:flex;justify-content:space-between;font-size:18px;">
                            <span><strong>Total Paid: </strong></span>
                            <strong style="color:#e8650a;">₹ {total:,.2f}</strong>
                        </p>
                    </div>

                    <p style="margin-top:24px;font-size:14px;color:#555;line-height:1.6;">
                        You can track your order from the Fanfinity orders page.
                        <br>
                        Thank you visit Again!!!!!
                    </p>
                </div>
            </div>
        </body>
        </html>
        """

        msg = MIMEMultipart("alternative")
        msg["From"] = f"Fanfinity <{sender_email}>"
        msg["To"] = to_email
        msg["Subject"] = subject

        msg.attach(MIMEText(html_body, "html"))

        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(sender_email, sender_password)
        server.sendmail(sender_email, to_email, msg.as_string())
        server.quit()

        print("EMAIL SENT SUCCESSFULLY")
        return True

    except Exception as e:
        print("EMAIL ERROR:", str(e))
        return False

# ============================================================
# PRODUCTS API
# ============================================================

@app.route("/api/products", methods=["GET"])
def get_all_products():
    """
    GET /api/products                        -> all products
    GET /api/products?category=anime         -> anime
    GET /api/products?category=music         -> kpop + pop
    GET /api/products?category=movies&series -> movies + series
    """

    category = request.args.get("category", "").lower().strip()

    if category == "music":
        rows = fetch_products("""
            SELECT * FROM products
            WHERE category_id IN (6, 7)
            ORDER BY product_id ASC
        """)
    elif category in ["movies&series", "movies-series", "movies_series"]:
        rows = fetch_products("""
            SELECT * FROM products
            WHERE category_id IN (4, 5)
            ORDER BY product_id ASC
        """)
    elif category in CATEGORY_MAP:
        rows = fetch_products("""
            SELECT * FROM products
            WHERE category_id = %s
            ORDER BY product_id ASC
        """, (CATEGORY_MAP[category],))
    else:
        rows = fetch_products("""
            SELECT * FROM products
            ORDER BY product_id ASC
        """)

    return jsonify([format_product(r) for r in rows])


@app.route("/api/products/<string:section>", methods=["GET"])
def get_products_by_section(section):
    """
    GET /api/products/new           -> Newly Released
    GET /api/products/popular       -> Popular
    GET /api/products/recommended   -> Recommendations
    """

    section = section.lower().strip()

    if section == "new":
        rows = fetch_products("""
            SELECT * FROM products
            WHERE is_new = TRUE
            ORDER BY RANDOM()
            LIMIT 13
        """)
    elif section == "popular":
        rows = fetch_products("""
            SELECT * FROM products
            WHERE is_popular = TRUE
            ORDER BY RANDOM()
            LIMIT 7
        """)
    elif section == "recommended":
        rows = fetch_products("""
            SELECT * FROM products
            WHERE is_recommended = TRUE
            ORDER BY RANDOM()
            LIMIT 7
        """)
    else:
        return jsonify({"error": "Invalid section. Use: new | popular | recommended"}), 400

    return jsonify([format_product(r) for r in rows])

@app.route("/api/products/home/explore", methods=["GET"])
def get_home_explore_products():
    """
    GET /api/products/home/explore
    Returns mixed homepage products from all categories.
    """
    rows = fetch_products("""
        SELECT *
        FROM products
        WHERE show_on_home = TRUE
        ORDER BY RANDOM()
        LIMIT 18
    """)

    return jsonify([format_product(r) for r in rows])

@app.route("/api/product/<int:product_id>", methods=["GET"])
def get_product(product_id):
    """
    GET /api/product/101
    Returns full product details for popup/modal.
    """
    product = find_product(product_id)
    if not product:
        return jsonify({"error": "Product not found"}), 404
    return jsonify(product)


@app.route("/api/search", methods=["GET"])
def search_products():
    """
    GET /api/search?q=naruto
    """
    query = request.args.get("q", "").strip().lower()
    if not query:
        return jsonify([])

    like_query = f"%{query}%"

    rows = fetch_products("""
        SELECT * FROM products
        WHERE LOWER(product_name) LIKE %s
           OR LOWER(COALESCE(description, '')) LIKE %s
           OR LOWER(COALESCE(key_words, '')) LIKE %s
        ORDER BY product_id ASC
    """, (like_query, like_query, like_query))

    return jsonify([format_product(r) for r in rows])


# ============================================================
# AUTH  -  SIGNUP / LOGIN / LOGOUT
# ============================================================

@app.route("/api/signup", methods=["POST"])
def signup():
    data = request.get_json() or {}

    username = data.get("name", "").strip()   # signupName from frontend
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not username or not email or not password:
        return jsonify({"error": "All fields are required"}), 400

    if get_user_by_email(email):
        return jsonify({"error": "Email already registered"}), 409

    if get_user_by_username(username):
        return jsonify({"error": "Username already taken"}), 409

    password_hash = generate_password_hash(password)

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        cur.execute("""
            INSERT INTO users (username, email, password, role)
            VALUES (%s, %s, %s, %s)
            RETURNING user_id, username, email, role, joined_on
        """, (username, email, password_hash, "user"))

        new_user = cur.fetchone()
        conn.commit()

    except Exception as e:
        conn.rollback()
        cur.close()
        conn.close()
        return jsonify({"error": "Unable to create account", "details": str(e)}), 500

    cur.close()
    conn.close()

    session["user_id"] = new_user["user_id"]
    session["user_email"] = new_user["email"]
    session["user_name"] = new_user["username"]
    session["role"] = new_user["role"]

    return jsonify({
        "message": "Account created successfully",
        "user": {
            "user_id": new_user["user_id"],
            "username": new_user["username"],
            "email": new_user["email"],
            "role": new_user["role"]
        }
    }), 201


@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json() or {}

    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    user = get_user_by_email(email)

    if not user or not check_password_hash(user["password"], password):
        return jsonify({"error": "Invalid email or password"}), 401

    session["user_id"] = user["user_id"]
    session["user_email"] = user["email"]
    session["user_name"] = user["username"]
    session["role"] = user["role"]

    return jsonify({
    "message": "Login successful",
    "user": {
        "user_id": user["user_id"],
        "username": user["username"],
        "email": user["email"],
        "role": user["role"]
    },
    "redirect": "admin" if user["role"] == "admin" else "user"
}), 200


@app.route("/api/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"message": "Logged out successfully"}), 200

#------------------------------------ current working code -------------------------------------
# @app.route("/api/me", methods=["GET"])
# @login_required
# def me():
#     user = get_user_by_email(session["user_email"])

#     if not user:
#         session.clear()
#         return jsonify({"error": "User not found"}), 404

#     return jsonify({
#         "user_id": user["user_id"],
#         "username": user["username"],
#         "email": user["email"],
#         "role": user["role"],
#         "joined_on": user["joined_on"]
#     }), 200
#----------------------------------------------- old code -------------------------------------------
# @app.route("/api/me", methods=["GET"])
# @login_required
# def me():
#     user = get_user_by_email(session["user_email"])

#     if not user:
#         session.clear()
#         return jsonify({"error": "User not found"}), 404

#     return jsonify({
#         "user_id": user["user_id"],
#         "username": user["username"],
#         "email": user["email"],
#         "phone_no": user.get("phone_no", ""),
#         "address": user.get("address", ""),
#         "city": user.get("city", ""),
#         "state": user.get("state", ""),
#         "country": user.get("country", ""),
#         "pincode": user.get("pincode", ""),
#         "role": user["role"],
#         "joined_on": user["joined_on"]
#     }), 200

#------------------------------------- new code ---------------------------------------
@app.route("/api/me", methods=["GET"])
@login_required
def me():
    user = get_user_by_id(session["user_id"])

    if not user:
        session.clear()
        return jsonify({"error": "User not found"}), 404

    # keep session synced
    session["user_email"] = user["email"]
    session["user_name"] = user["username"]

    return jsonify({
        "user_id": user["user_id"],
        "username": user["username"],
        "email": user["email"],
        "phone_no": user.get("phone_no", ""),
        "address": user.get("address", ""),
        "city": user.get("city", ""),
        "state": user.get("state", ""),
        "country": user.get("country", ""),
        "pincode": user.get("pincode", ""),
        "role": user["role"],
        "joined_on": user["joined_on"]
    }), 200

#--------------------------------------- /api/profile/update ---------------------------------
# @app.route("/api/profile/update", methods=["POST"])
# @login_required
# def update_profile():
#     data = request.get_json() or {}

#     username = data.get("username", "").strip()
#     phone_no = data.get("phone_no", "").strip()
#     address = data.get("address", "").strip()
#     city = data.get("city", "").strip()
#     state = data.get("state", "").strip()
#     country = data.get("country", "").strip()
#     pincode = data.get("pincode", "").strip()

#     # -------- validation --------
#     if not username:
#         return jsonify({"error": "Username is required"}), 400

#     if len(username) < 3:
#         return jsonify({"error": "Username must be at least 3 characters"}), 400

#     if len(username) > 50:
#         return jsonify({"error": "Username cannot exceed 50 characters"}), 400

#     if phone_no:
#         if not phone_no.isdigit():
#             return jsonify({"error": "Phone number must contain only digits"}), 400
#         if len(phone_no) < 10 or len(phone_no) > 15:
#             return jsonify({"error": "Phone number must be between 10 and 15 digits"}), 400

#     if pincode:
#         if not pincode.isdigit():
#             return jsonify({"error": "Pincode must contain only digits"}), 400
#         if len(pincode) < 4 or len(pincode) > 10:
#             return jsonify({"error": "Pincode length is invalid"}), 400

#     conn = get_db_connection()
#     cur = conn.cursor(cursor_factory=RealDictCursor)

#     try:
#         # Check whether username is already used by another user
#         cur.execute("""
#             SELECT user_id
#             FROM users
#             WHERE username = %s AND user_id <> %s
#         """, (username, session["user_id"]))

#         existing_user = cur.fetchone()
#         if existing_user:
#             cur.close()
#             conn.close()
#             return jsonify({"error": "Username already taken"}), 409

#         cur.execute("""
#             UPDATE users
#             SET
#                 username = %s,
#                 phone_no = %s,
#                 address = %s,
#                 city = %s,
#                 state = %s,
#                 country = %s,
#                 pincode = %s
#             WHERE user_id = %s
#             RETURNING
#                 user_id,
#                 username,
#                 email,
#                 phone_no,
#                 address,
#                 city,
#                 state,
#                 country,
#                 pincode,
#                 role,
#                 joined_on
#         """, (
#             username,
#             phone_no,
#             address,
#             city,
#             state,
#             country if country else "India",
#             pincode,
#             session["user_id"]
#         ))

#         updated_user = cur.fetchone()
#         conn.commit()

#         # keep session synced with new username
#         session["user_name"] = updated_user["username"]

#         cur.close()
#         conn.close()

#         return jsonify({
#             "message": "Profile updated successfully",
#             "user": updated_user
#         }), 200

#     except Exception as e:
#         conn.rollback()
#         cur.close()
#         conn.close()
#         return jsonify({
#             "error": "Failed to update profile",
#             "details": str(e)
#         }), 500

# @app.route("/api/profile/update", methods=["POST"])
# @login_required
# def update_profile():
#     data = request.get_json() or {}

#     username = data.get("username", "").strip()
#     phone_no = data.get("phone_no", "").strip()
#     address = data.get("address", "").strip()
#     city = data.get("city", "").strip()
#     state = data.get("state", "").strip()
#     country = data.get("country", "").strip()
#     pincode = data.get("pincode", "").strip()

#     conn = get_db_connection()
#     cur = conn.cursor(cursor_factory=RealDictCursor)

#     try:
#         # get current user first
#         cur.execute("""
#             SELECT user_id, username, email, phone_no, address, city, state, country, pincode, role, joined_on
#             FROM users
#             WHERE user_id = %s
#         """, (session["user_id"],))

#         existing_user = cur.fetchone()

#         if not existing_user:
#             cur.close()
#             conn.close()
#             return jsonify({"error": "User not found"}), 404

#         # use old values if not sent
#         final_username = username if username else existing_user["username"]
#         final_phone_no = phone_no if phone_no else existing_user["phone_no"]
#         final_country = country if country else (existing_user["country"] or "India")

#         # validate username only if it is being changed/sent
#         if final_username and len(final_username) < 3:
#             cur.close()
#             conn.close()
#             return jsonify({"error": "Username must be at least 3 characters"}), 400

#         if len(final_username) > 50:
#             cur.close()
#             conn.close()
#             return jsonify({"error": "Username cannot exceed 50 characters"}), 400

#         if final_phone_no:
#             if not final_phone_no.isdigit():
#                 cur.close()
#                 conn.close()
#                 return jsonify({"error": "Phone number must contain only digits"}), 400
#             if len(final_phone_no) < 10 or len(final_phone_no) > 15:
#                 cur.close()
#                 conn.close()
#                 return jsonify({"error": "Phone number must be between 10 and 15 digits"}), 400

#         if pincode:
#             if not pincode.isdigit():
#                 cur.close()
#                 conn.close()
#                 return jsonify({"error": "Pincode must contain only digits"}), 400
#             if len(pincode) < 4 or len(pincode) > 10:
#                 cur.close()
#                 conn.close()
#                 return jsonify({"error": "Pincode length is invalid"}), 400

#         # check username uniqueness only if needed
#         cur.execute("""
#             SELECT user_id
#             FROM users
#             WHERE username = %s AND user_id <> %s
#         """, (final_username, session["user_id"]))

#         duplicate_user = cur.fetchone()
#         if duplicate_user:
#             cur.close()
#             conn.close()
#             return jsonify({"error": "Username already taken"}), 409

#         cur.execute("""
#             UPDATE users
#             SET
#                 username = %s,
#                 phone_no = %s,
#                 address = %s,
#                 city = %s,
#                 state = %s,
#                 country = %s,
#                 pincode = %s
#             WHERE user_id = %s
#             RETURNING
#                 user_id,
#                 username,
#                 email,
#                 phone_no,
#                 address,
#                 city,
#                 state,
#                 country,
#                 pincode,
#                 role,
#                 joined_on
#         """, (
#             final_username,
#             final_phone_no,
#             address,
#             city,
#             state,
#             final_country,
#             pincode,
#             session["user_id"]
#         ))

#         updated_user = cur.fetchone()
#         conn.commit()

#         session["user_name"] = updated_user["username"]

#         cur.close()
#         conn.close()

#         return jsonify({
#             "message": "Profile updated successfully",
#             "user": updated_user
#         }), 200

#     except Exception as e:
#         conn.rollback()
#         cur.close()
#         conn.close()
#         return jsonify({
#             "error": "Failed to update profile",
#             "details": str(e)
#         }), 500

# @app.route("/api/signup", methods=["POST"])
# def signup():
#     data     = request.get_json()
#     name     = data.get("name", "").strip()
#     email    = data.get("email", "").strip().lower()
#     password = data.get("password", "")

#     if not name or not email or not password:
#         return jsonify({"error": "All fields are required"}), 400
#     if find_user(email):
#         return jsonify({"error": "Email already registered"}), 409

#     new_user = {
#         "id": len(users) + 1,
#         "name": name, "email": email,
#         "password": hash_password(password),
#         "phone": "", "address": "",
#         "role": "user",
#         "joined": datetime.now().strftime("%d/%m/%Y"),
#     }
#     users.append(new_user)
#     wishlists[email] = []
#     carts[email]     = []

#     session["user_email"] = email
#     session["user_name"]  = name
#     session["role"]       = "user"

#     return jsonify({"message": "Account created successfully", "name": name}), 201


# @app.route("/api/login", methods=["POST"])
# def login():
#     data     = request.get_json()
#     email    = data.get("email", "").strip().lower()
#     password = data.get("password", "")

#     user = find_user(email)
#     if not user or user["password"] != hash_password(password):
#         return jsonify({"error": "Invalid email or password"}), 401

#     session["user_email"] = email
#     session["user_name"]  = user["name"]
#     session["role"]       = user.get("role", "user")

#     return jsonify({
#         "message": "Login successful",
#         "name": user["name"],
#         "role": user.get("role", "user")
#     })


# @app.route("/api/logout", methods=["POST"])
# def logout():
#     session.clear()
#     return jsonify({"message": "Logged out"})


# @app.route("/api/me", methods=["GET"])
# @login_required
# def me():
#     """Returns logged-in user profile for profile.html"""
#     user = find_user(session["user_email"])
#     if not user:
#         return jsonify({"error": "User not found"}), 404
#     safe = {k: v for k, v in user.items() if k != "password"}
#     return jsonify(safe)

@app.route("/api/profile/account/update", methods=["POST"])
@login_required
def update_account_profile():
    data = request.get_json() or {}

    username = data.get("username", "").strip()
    email = data.get("email", "").strip().lower()

    if not username:
        return jsonify({"error": "Username is required"}), 400

    if len(username) < 3:
        return jsonify({"error": "Username must be at least 3 characters"}), 400

    if len(username) > 50:
        return jsonify({"error": "Username cannot exceed 50 characters"}), 400

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        cur.execute("""
            SELECT user_id, username, email
            FROM users
            WHERE user_id = %s
        """, (session["user_id"],))
        current_user = cur.fetchone()

        if not current_user:
            cur.close()
            conn.close()
            return jsonify({"error": "User not found"}), 404

        final_email = email if email else current_user["email"]

        if final_email != current_user["email"]:
            cur.execute("""
                SELECT user_id FROM users
                WHERE email = %s AND user_id <> %s
            """, (final_email, session["user_id"]))
            duplicate_email = cur.fetchone()
            if duplicate_email:
                cur.close()
                conn.close()
                return jsonify({"error": "Email already in use"}), 409

        cur.execute("""
            SELECT user_id FROM users
            WHERE username = %s AND user_id <> %s
        """, (username, session["user_id"]))
        duplicate_username = cur.fetchone()
        if duplicate_username:
            cur.close()
            conn.close()
            return jsonify({"error": "Username already taken"}), 409

        cur.execute("""
            UPDATE users
            SET
                username = %s,
                email = %s
            WHERE user_id = %s
            RETURNING user_id, username, email, role, joined_on
        """, (username, final_email, session["user_id"]))

        updated_user = cur.fetchone()
        conn.commit()

        session["user_name"] = updated_user["username"]
        session["user_email"] = updated_user["email"]

        cur.close()
        conn.close()

        return jsonify({
            "message": "Account details updated successfully",
            "user": updated_user
        }), 200

    except Exception as e:
        conn.rollback()
        cur.close()
        conn.close()
        return jsonify({"error": "Failed to update account", "details": str(e)}), 500
    


@app.route("/api/profile/address/update", methods=["POST"])
@login_required
def update_address_profile():
    data = request.get_json() or {}

    address = data.get("address", "").strip()
    city = data.get("city", "").strip()
    state = data.get("state", "").strip()
    country = data.get("country", "").strip()
    pincode = data.get("pincode", "").strip()

    if not address:
        return jsonify({"error": "Address is required"}), 400
    if not city:
        return jsonify({"error": "City is required"}), 400
    if not state:
        return jsonify({"error": "State is required"}), 400
    if not country:
        return jsonify({"error": "Country is required"}), 400
    if not pincode:
        return jsonify({"error": "Pincode is required"}), 400
    if not pincode.isdigit():
        return jsonify({"error": "Pincode must contain only digits"}), 400

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        cur.execute("""
            UPDATE users
            SET
                address = %s,
                city = %s,
                state = %s,
                country = %s,
                pincode = %s
            WHERE user_id = %s
            RETURNING user_id, username, email, address, city, state, country, pincode, role, joined_on
        """, (address, city, state, country, pincode, session["user_id"]))

        updated_user = cur.fetchone()
        conn.commit()

        cur.close()
        conn.close()

        return jsonify({
            "message": "Address updated successfully",
            "user": updated_user
        }), 200

    except Exception as e:
        conn.rollback()
        cur.close()
        conn.close()
        return jsonify({"error": "Failed to update address", "details": str(e)}), 500
    

@app.route("/api/profile/send-otp", methods=["POST"])
@login_required
def send_profile_otp():
    data = request.get_json() or {}
    purpose = data.get("purpose", "").strip()
    new_email = data.get("email", "").strip().lower()

    if purpose != "change_password":
        return jsonify({"error": "Invalid OTP purpose"}), 400

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        cur.execute("""
            SELECT user_id, email
            FROM users
            WHERE user_id = %s
        """, (session["user_id"],))
        user = cur.fetchone()

        if not user:
            cur.close()
            conn.close()
            return jsonify({"error": "User not found"}), 404

        target_email = new_email if new_email else user["email"]

        if new_email and new_email != user["email"]:
            cur.execute("""
                SELECT user_id FROM users
                WHERE email = %s AND user_id <> %s
            """, (new_email, session["user_id"]))
            duplicate_email = cur.fetchone()
            if duplicate_email:
                cur.close()
                conn.close()
                return jsonify({"error": "Email already in use"}), 409

        otp_code = generate_otp()
        otp_expiry = datetime.utcnow() + timedelta(minutes=5)

        cur.execute("""
            UPDATE users
            SET
                otp_code = %s,
                otp_expiry = %s,
                otp_verified = FALSE,
                otp_purpose = %s,
                pending_email = %s
            WHERE user_id = %s
        """, (otp_code, otp_expiry, "change_password", target_email if target_email != user["email"] else "", session["user_id"]))

        conn.commit()
        print("OTP saved in DB for user:", session["user_id"], otp_code, otp_expiry, target_email)
        send_otp_email(target_email, otp_code)

        cur.close()
        conn.close()

        return jsonify({
            "message": f"OTP sent successfully to {target_email}",
            "expires_in_seconds": 300
        }), 200

    except Exception as e:
        conn.rollback()
        cur.close()
        conn.close()
        return jsonify({"error": "Failed to send OTP", "details": str(e)}), 500


@app.route("/api/profile/verify-otp", methods=["POST"])
@login_required
def verify_profile_otp():
    data = request.get_json() or {}
    otp_code = data.get("otp_code", "").strip()

    if not otp_code:
        return jsonify({"error": "OTP is required"}), 400

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        cur.execute("""
            SELECT otp_code, otp_expiry, otp_purpose
            FROM users
            WHERE user_id = %s
        """, (session["user_id"],))
        user = cur.fetchone()

        if not user:
            cur.close()
            conn.close()
            return jsonify({"error": "User not found"}), 404

        if not user["otp_code"]:
            cur.close()
            conn.close()
            return jsonify({"error": "No OTP found. Please resend OTP."}), 400

        if datetime.utcnow() > user["otp_expiry"]:
            cur.close()
            conn.close()
            return jsonify({"error": "OTP expired. Please resend OTP."}), 400

        if otp_code != user["otp_code"]:
            cur.close()
            conn.close()
            return jsonify({"error": "Invalid OTP"}), 400

        cur.execute("""
            UPDATE users
            SET otp_verified = TRUE
            WHERE user_id = %s
        """, (session["user_id"],))
        conn.commit()

        cur.close()
        conn.close()

        return jsonify({"message": "OTP verified successfully"}), 200

    except Exception as e:
        conn.rollback()
        cur.close()
        conn.close()
        return jsonify({"error": "Failed to verify OTP", "details": str(e)}), 500


@app.route("/api/profile/password/update", methods=["POST"])
@login_required
def update_profile_password():
    data = request.get_json() or {}

    username = data.get("username", "").strip()
    email = data.get("email", "").strip().lower()
    new_password = data.get("new_password", "")
    confirm_password = data.get("confirm_password", "")

    if not username:
        return jsonify({"error": "Username is required"}), 400

    if len(username) < 3:
        return jsonify({"error": "Username must be at least 3 characters"}), 400

    if not new_password:
        return jsonify({"error": "New password is required"}), 400

    if len(new_password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400

    if new_password != confirm_password:
        return jsonify({"error": "Passwords do not match"}), 400

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        cur.execute("""
            SELECT email, otp_verified, pending_email
            FROM users
            WHERE user_id = %s
        """, (session["user_id"],))
        user = cur.fetchone()

        if not user:
            cur.close()
            conn.close()
            return jsonify({"error": "User not found"}), 404

        if not user["otp_verified"]:
            cur.close()
            conn.close()
            return jsonify({"error": "Please verify OTP first"}), 400

        final_email = email if email else user["email"]

        if final_email != user["email"]:
            cur.execute("""
                SELECT user_id FROM users
                WHERE email = %s AND user_id <> %s
            """, (final_email, session["user_id"]))
            duplicate_email = cur.fetchone()
            if duplicate_email:
                cur.close()
                conn.close()
                return jsonify({"error": "Email already in use"}), 409

        cur.execute("""
            SELECT user_id FROM users
            WHERE username = %s AND user_id <> %s
        """, (username, session["user_id"]))
        duplicate_username = cur.fetchone()
        if duplicate_username:
            cur.close()
            conn.close()
            return jsonify({"error": "Username already taken"}), 409

        password_hash = generate_password_hash(new_password)

        cur.execute("""
            UPDATE users
            SET
                username = %s,
                email = %s,
                password = %s,
                otp_code = '',
                otp_expiry = NULL,
                otp_verified = FALSE,
                otp_purpose = '',
                pending_email = ''
            WHERE user_id = %s
            RETURNING user_id, username, email, role, joined_on
        """, (username, final_email, password_hash, session["user_id"]))

        updated_user = cur.fetchone()
        conn.commit()

        session["user_name"] = updated_user["username"]
        session["user_email"] = updated_user["email"]

        cur.close()
        conn.close()

        return jsonify({
            "message": "Password updated successfully",
            "user": updated_user
        }), 200

    except Exception as e:
        conn.rollback()
        cur.close()
        conn.close()
        return jsonify({"error": "Failed to update password", "details": str(e)}), 500



# ============================================================
# CART
# ============================================================

# @app.route("/api/cart", methods=["GET"])
# @login_required
# def view_cart():
#     email      = session["user_email"]
#     cart_items = carts.get(email, [])
#     enriched   = []

#     for item in cart_items:
#         product = find_product(item["product_id"])
#         if product:
#             enriched.append({
#                 "product_id": product["id"],
#                 "name":       product["name"],
#                 "price":      product["price"],
#                 "old_price":  product["old_price"],
#                 "image":      product["image"],
#                 "category":   product["category"],
#                 "quantity":   item["quantity"],
#                 "subtotal":   product["price"] * item["quantity"],
#             })

#     return jsonify(enriched)

@app.route("/api/cart", methods=["GET"])
@login_required
def view_cart():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT
            c.product_id AS id,
            c.quantity,
            c.added_at,
            p.product_name AS name,
            p.price,
            p.mrp AS old_price,
            p.image_link AS image,
            p.rating
        FROM cart c
        JOIN products p ON c.product_id = p.product_id
        WHERE c.user_id = %s
        ORDER BY c.added_at DESC
    """, (session["user_id"],))

    rows = cur.fetchall()
    cur.close()
    conn.close()

    return jsonify(rows), 200

#--------------------------------- old version of code ----------------------------------
# @app.route("/api/cart/add", methods=["POST"])
# @login_required
# def add_to_cart():
#     data       = request.get_json()
#     email      = session["user_email"]
#     product_id = data.get("product_id")
#     quantity   = int(data.get("quantity", 1))

#     if not find_product(product_id):
#         return jsonify({"error": "Product not found"}), 404

#     cart = carts.setdefault(email, [])
#     for item in cart:
#         if item["product_id"] == product_id:
#             item["quantity"] += quantity
#             return jsonify({"message": "Cart updated", "quantity": item["quantity"]})

#     cart.append({"product_id": product_id, "quantity": quantity})
#     return jsonify({"message": "Added to cart"}), 201

#---------------------------------- new version of code ----------------------------------
@app.route("/api/cart/add", methods=["POST"])
@login_required
def add_to_cart():
    data = request.get_json() or {}
    product_id = data.get("product_id")
    quantity = int(data.get("quantity", 1))

    if not product_id:
        return jsonify({"error": "product_id is required"}), 400

    if quantity < 1:
        quantity = 1

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT cart_id, quantity
        FROM cart
        WHERE user_id = %s AND product_id = %s
    """, (session["user_id"], product_id))

    existing = cur.fetchone()

    if existing:
        cur.execute("""
            UPDATE cart
            SET quantity = quantity + %s
            WHERE user_id = %s AND product_id = %s
        """, (quantity, session["user_id"], product_id))
    else:
        cur.execute("""
            INSERT INTO cart (user_id, product_id, quantity)
            VALUES (%s, %s, %s)
        """, (session["user_id"], product_id, quantity))

    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"message": "Product added to cart"}), 200

#------------------------------- old version of code ----------------------------------
# @app.route("/api/cart/remove", methods=["POST"])
# @login_required
# def remove_from_cart():
#     data       = request.get_json()
#     email      = session["user_email"]
#     product_id = data.get("product_id")
#     carts[email] = [i for i in carts.get(email, []) if i["product_id"] != product_id]
#     return jsonify({"message": "Item removed from cart"})

#---------------------------------- new version of code --------------------------------
@app.route("/api/cart/remove", methods=["POST"])
@login_required
def remove_from_cart():
    data = request.get_json() or {}
    product_id = data.get("product_id")

    if not product_id:
        return jsonify({"error": "product_id is required"}), 400

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        DELETE FROM cart
        WHERE user_id = %s AND product_id = %s
    """, (session["user_id"], product_id))

    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"message": "Item removed from cart"}), 200

#---------------------------------- old version ---------------------------
# @app.route("/api/cart/update", methods=["POST"])
# @login_required
# def update_cart():
#     data       = request.get_json()
#     email      = session["user_email"]
#     product_id = data.get("product_id")
#     quantity   = int(data.get("quantity", 1))

#     if quantity < 1:
#         return jsonify({"error": "Quantity must be at least 1"}), 400

#     for item in carts.get(email, []):
#         if item["product_id"] == product_id:
#             item["quantity"] = quantity
#             return jsonify({"message": "Quantity updated"})

#     return jsonify({"error": "Item not in cart"}), 404

#---------------------------------- new version ----------------------------------------
@app.route("/api/cart/update", methods=["POST"])
@login_required
def update_cart_quantity():
    data = request.get_json() or {}
    product_id = data.get("product_id")
    quantity = int(data.get("quantity", 1))

    if not product_id:
        return jsonify({"error": "product_id is required"}), 400

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    if quantity <= 0:
        cur.execute("""
            DELETE FROM cart
            WHERE user_id = %s AND product_id = %s
        """, (session["user_id"], product_id))
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"message": "Item removed from cart"}), 200

    cur.execute("""
        UPDATE cart
        SET quantity = %s
        WHERE user_id = %s AND product_id = %s
    """, (quantity, session["user_id"], product_id))

    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"message": "Cart updated"}), 200


# ============================================================
# WISHLIST
# ============================================================

#------------------------- previous version of code --------------------------

# @app.route("/api/wishlist", methods=["GET"])
# @login_required
# def view_wishlist():
#     email  = session["user_email"]
#     ids    = wishlists.get(email, [])
#     result = []

#     for product_id in ids:
#         product = find_product(product_id)
#         if product:
#             result.append(product)

#     return jsonify(result)

#--------------------------- current version of code ------------------------------

@app.route("/api/wishlist", methods=["GET"])
@login_required
def view_wishlist():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT
            p.product_id AS id,
            p.product_name AS name,
            p.price,
            p.mrp AS old_price,
            p.image_link AS image,
            p.rating
        FROM wishlist w
        JOIN products p ON w.product_id = p.product_id
        WHERE w.user_id = %s
        ORDER BY w.created_at DESC
    """, (session["user_id"],))

    rows = cur.fetchall()
    cur.close()
    conn.close()

    return jsonify(rows), 200

#------------------------- previous version of code --------------------------

# @app.route("/api/wishlist/toggle", methods=["POST"])
# @login_required
# def toggle_wishlist():
#     data       = request.get_json()
#     email      = session["user_email"]
#     product_id = data.get("product_id")

#     if not find_product(product_id):
#         return jsonify({"error": "Product not found"}), 404

#     wishlist = wishlists.setdefault(email, [])
#     if product_id in wishlist:
#         wishlist.remove(product_id)
#         return jsonify({"message": "Removed from wishlist", "wishlisted": False})
#     else:
#         wishlist.append(product_id)
#         return jsonify({"message": "Added to wishlist", "wishlisted": True})

#--------------------------- current version of code ------------------------------

@app.route("/api/wishlist/toggle", methods=["POST"])
@login_required
def toggle_wishlist():
    data = request.get_json() or {}
    product_id = data.get("product_id")

    if not product_id:
        return jsonify({"error": "product_id is required"}), 400

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT 1 FROM wishlist
        WHERE user_id = %s AND product_id = %s
    """, (session["user_id"], product_id))

    exists = cur.fetchone()

    if exists:
        cur.execute("""
            DELETE FROM wishlist
            WHERE user_id = %s AND product_id = %s
        """, (session["user_id"], product_id))
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"message": "Removed from wishlist", "wishlisted": False})
    else:
        cur.execute("""
            INSERT INTO wishlist (user_id, product_id)
            VALUES (%s, %s)
            ON CONFLICT (user_id, product_id) DO NOTHING
        """, (session["user_id"], product_id))
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"message": "Added to wishlist", "wishlisted": True})

#------------------------- previous version of code --------------------------
# @app.route("/api/wishlist/check/<int:product_id>", methods=["GET"])
# @login_required
# def check_wishlist(product_id):
#     email    = session["user_email"]
#     wishlist = wishlists.get(email, [])
#     return jsonify({"wishlisted": product_id in wishlist})

#--------------------------- current version of code ------------------------------

@app.route("/api/wishlist/check/<int:product_id>", methods=["GET"])
@login_required
def check_wishlist(product_id):
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT 1 FROM wishlist
        WHERE user_id = %s AND product_id = %s
    """, (session["user_id"], product_id))

    exists = cur.fetchone() is not None

    cur.close()
    conn.close()

    return jsonify({"wishlisted": exists})


# ============================================================
# ORDERS
# ============================================================

# @app.route("/api/orders", methods=["GET"])
# @login_required
# def get_orders():
#     email = session["user_email"]
#     if session.get("role") == "admin":
#         return jsonify(orders)
#     return jsonify([o for o in orders if o["user_email"] == email])

# @app.route("/api/orders", methods=["GET"])
# @login_required
# def get_orders():
#     conn = get_db_connection()
#     cur = conn.cursor(cursor_factory=RealDictCursor)

#     try:
        

#         if session.get("role") == "admin":
#             cur.execute("""
#                 SELECT
#                     o.order_id,
#                     o.order_code,
#                     o.user_id,
#                     u.username,
#                     u.email,
#                     o.total_amount,
#                     o.gst_amount,
#                     o.order_status,
#                     o.payment_method,
#                     o.created_at
#                 FROM orders o
#                 LEFT JOIN users u ON o.user_id = u.user_id
#                 ORDER BY o.created_at DESC
#             """)
#             rows = cur.fetchall()
#         else:
#             cur.execute("""
#                 SELECT
#                     o.order_id,
#                     o.order_code,
#                     o.user_id,
#                     u.username,
#                     u.email,
#                     o.total_amount,
#                     o.gst_amount,
#                     o.order_status,
#                     o.payment_method,
#                     o.created_at
#                 FROM orders o
#                 LEFT JOIN users u ON o.user_id = u.user_id
#                 WHERE o.user_id = %s
#                 ORDER BY o.created_at DESC
#             """, (session["user_id"],))
#             rows = cur.fetchall()

#         return jsonify(rows), 200

#     except Exception as e:
#         return jsonify({"error": "Failed to fetch orders", "details": str(e)}), 500

#     finally:
#         cur.close()
#         conn.close()

#-------------------------------------- current used code -----------------------------------------
# @app.route("/api/orders", methods=["GET"])
# @login_required
# def get_orders():
#     conn = get_db_connection()
#     cur = conn.cursor(cursor_factory=RealDictCursor)

#     try:
#         # 1. auto-mark old pending orders as delivered
#         cur.execute("""
#             UPDATE orders
#             SET
#                 order_status = 'Delivered',
#                 delivered_at = NOW()
#             WHERE order_status = 'Yet to be Delivered'
#               AND estimated_delivery_date IS NOT NULL
#               AND estimated_delivery_date <= CURRENT_DATE
#         """)

#         # 2. add a delivered tracking row only if it does not already exist
#         cur.execute("""
#             INSERT INTO order_tracking (order_id, status, status_message, updated_at)
#             SELECT
#                 o.order_id,
#                 'Delivered',
#                 'Your order has been delivered successfully.',
#                 NOW()
#             FROM orders o
#             WHERE o.order_status = 'Delivered'
#               AND NOT EXISTS (
#                   SELECT 1
#                   FROM order_tracking ot
#                   WHERE ot.order_id = o.order_id
#                     AND ot.status = 'Delivered'
#               )
#         """)

#         conn.commit()

#         # 3. fetch orders
#         if session.get("role") == "admin":
#             cur.execute("""
#                 SELECT
#                     o.order_id,
#                     o.order_code,
#                     o.user_id,
#                     u.username,
#                     u.email,
#                     o.total_amount,
#                     o.gst_amount,
#                     o.order_status,
#                     o.payment_method,
#                     o.created_at,
#                     o.estimated_delivery_date,
#                     o.delivered_at
#                 FROM orders o
#                 LEFT JOIN users u ON o.user_id = u.user_id
#                 ORDER BY o.created_at DESC
#             """)
#             rows = cur.fetchall()
#         else:
#             cur.execute("""
#                 SELECT
#                     o.order_id,
#                     o.order_code,
#                     o.user_id,
#                     u.username,
#                     u.email,
#                     o.total_amount,
#                     o.gst_amount,
#                     o.order_status,
#                     o.payment_method,
#                     o.created_at,
#                     o.estimated_delivery_date,
#                     o.delivered_at
#                 FROM orders o
#                 LEFT JOIN users u ON o.user_id = u.user_id
#                 WHERE o.user_id = %s
#                 ORDER BY o.created_at DESC
#             """, (session["user_id"],))
#             rows = cur.fetchall()

#         return jsonify(rows), 200

#     except Exception as e:
#         return jsonify({"error": "Failed to fetch orders", "details": str(e)}), 500

#     finally:
#         cur.close()
#         conn.close()

#-------------------------------------------- new code ---------------------------------

@app.route("/api/orders", methods=["GET"])
@login_required
def get_orders():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        # 1. auto-mark old pending orders as delivered
        cur.execute("""
            UPDATE orders
            SET
                order_status = 'Delivered',
                delivered_at = NOW()
            WHERE order_status = 'Yet to be Delivered'
              AND estimated_delivery_date IS NOT NULL
              AND estimated_delivery_date <= CURRENT_DATE
        """)

        # 2. add delivered tracking row only once
        cur.execute("""
            INSERT INTO order_tracking (order_id, status, status_message, updated_at)
            SELECT
                o.order_id,
                'Delivered',
                'Your order has been delivered successfully.',
                NOW()
            FROM orders o
            WHERE o.order_status = 'Delivered'
              AND NOT EXISTS (
                  SELECT 1
                  FROM order_tracking ot
                  WHERE ot.order_id = o.order_id
                    AND ot.status = 'Delivered'
              )
        """)

        conn.commit()

        # 3. fetch product-level order cards
        if session.get("role") == "admin":
            cur.execute("""
                SELECT
                    o.order_id,
                    o.order_code,
                    o.user_id,
                    u.username,
                    u.email,
                    o.total_amount,
                    o.gst_amount,
                    o.order_status,
                    o.payment_method,
                    o.created_at,
                    o.estimated_delivery_date,
                    o.delivered_at,

                    oi.order_item_id,
                    oi.product_id,
                    oi.product_name,
                    oi.image_link,
                    oi.price,
                    oi.quantity,

                    p.mrp,
                    p.rating
                FROM orders o
                JOIN order_items oi ON o.order_id = oi.order_id
                LEFT JOIN users u ON o.user_id = u.user_id
                LEFT JOIN products p ON oi.product_id = p.product_id
                ORDER BY o.created_at DESC, oi.order_item_id DESC
            """)
            rows = cur.fetchall()
        else:
            cur.execute("""
                SELECT
                    o.order_id,
                    o.order_code,
                    o.user_id,
                    u.username,
                    u.email,
                    o.total_amount,
                    o.gst_amount,
                    o.order_status,
                    o.payment_method,
                    o.created_at,
                    o.estimated_delivery_date,
                    o.delivered_at,

                    oi.order_item_id,
                    oi.product_id,
                    oi.product_name,
                    oi.image_link,
                    oi.price,
                    oi.quantity,

                    p.mrp,
                    p.rating
                FROM orders o
                JOIN order_items oi ON o.order_id = oi.order_id
                LEFT JOIN users u ON o.user_id = u.user_id
                LEFT JOIN products p ON oi.product_id = p.product_id
                WHERE o.user_id = %s
                ORDER BY o.created_at DESC, oi.order_item_id DESC
            """, (session["user_id"],))
            rows = cur.fetchall()

        return jsonify(rows), 200

    except Exception as e:
        return jsonify({"error": "Failed to fetch orders", "details": str(e)}), 500

    finally:
        cur.close()
        conn.close()

# @app.route("/api/orders/place", methods=["POST"])
# @login_required
# def place_order():
#     email = session["user_email"]
#     cart  = cart.get(email, [])

#     if not cart:
#         return jsonify({"error": "Cart is empty"}), 400

#     order_items = []
#     total = 0

#     for item in cart:
#         product = find_product(item["product_id"])
#         if product:
#             subtotal = product["price"] * item["quantity"]
#             total   += subtotal
#             order_items.append({
#                 "product_id": product["id"],
#                 "name":       product["name"],
#                 "image":      product["image"],
#                 "price":      product["price"],
#                 "quantity":   item["quantity"],
#                 "subtotal":   subtotal,
#             })

#     order = {
#         "order_id":   f"FF{len(orders) + 1001}",
#         "user_email": email,
#         "user_name":  session.get("user_name", ""),
#         "items":      order_items,
#         "total":      total,
#         "status":     "Pending",
#         "placed_on":  datetime.now().strftime("%d/%m/%Y %H:%M"),
#     }

#     orders.append(order)
#     cart[email] = []

#     return jsonify({"message": "Order placed successfully", "order_id": order["order_id"]}), 201

#new order logic
@app.route("/api/orders/place", methods=["POST"])
@login_required
def place_order():
    data = request.get_json() or {}
    payment_method = data.get("payment_method", "cod")

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        # 1. Get cart items
        cur.execute("""
            SELECT c.product_id, c.quantity,
                   p.product_name, p.price, p.mrp, p.image_link
            FROM cart c
            JOIN products p ON c.product_id = p.product_id
            WHERE c.user_id = %s
        """, (session["user_id"],))

        cart_items = cur.fetchall()

        if not cart_items:
            return jsonify({"error": "Cart is empty"}), 400

        created_orders = []
        receipt_items = []
        grand_subtotal = 0
        grand_gst = 0
        grand_total = 0
        latest_delivery_date = None

        # 2. Process each cart item -> separate order
        for item in cart_items:
            quantity = item["quantity"]
            price = float(item["price"])
            subtotal = price * quantity
            gst = round(subtotal * 0.18, 2)
            total = subtotal + gst

            order_code = f"FF{random.randint(100000, 999999)}"
            delivery_date = datetime.now() + timedelta(days=random.randint(10, 16))

            # 3. Insert into orders
            cur.execute("""
                INSERT INTO orders (
                    order_code, user_id, total_amount, gst_amount,
                    payment_method, order_status, created_at, estimated_delivery_date
                )
                VALUES (%s, %s, %s, %s, %s, %s, NOW(), %s)
                RETURNING order_id
                
            """, (
                order_code,
                session["user_id"],
                subtotal,
                gst,
                payment_method,
                "Yet to be Delivered",
                delivery_date.date()  
            ))

            order_row = cur.fetchone()
            order_id = order_row["order_id"]

            # 4. Insert into order_items
            cur.execute("""
                INSERT INTO order_items (
                    order_id, product_id, product_name,
                    image_link, price, quantity
                )
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (
                order_id,
                item["product_id"],
                item["product_name"],
                item["image_link"],
                price,
                quantity
            ))

            # 5. Insert into payments
            payment_status = "SUCCESS" if payment_method == "upi" else "PENDING"
            transaction_ref = f"TXN{random.randint(10000, 99999)}" if payment_method == "upi" else ""

            cur.execute("""
                INSERT INTO payments (
                    order_id, user_id, payment_method,
                    payment_status, amount, transaction_ref, paid_at
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, (
                order_id,
                session["user_id"],
                payment_method,
                payment_status,
                total,
                transaction_ref,
                datetime.now() if payment_method == "upi" else None
            ))

            # 6. Insert into tracking
            cur.execute("""
                INSERT INTO order_tracking (
                    order_id, status, status_message, updated_at
                )
                VALUES (%s, %s, %s, NOW())
            """, (
                order_id,
                "Yet to be Delivered",
                f"Your order will be delivered by {delivery_date.strftime('%d %b %Y')}"
            ))

            

            created_orders.append(order_code)
            receipt_items.append({
                "product_name": item["product_name"],
                "quantity": quantity,
                "price": price
            })

            grand_subtotal += subtotal
            grand_gst += gst
            grand_total += total

            if latest_delivery_date is None or delivery_date > latest_delivery_date:
                latest_delivery_date = delivery_date


        # 7. Clear cart
        cur.execute("""
            DELETE FROM cart
            WHERE user_id = %s
        """, (session["user_id"],))

        # conn.commit()

        # return jsonify({
        #     "message": "Order placed successfully",
        #     "orders": created_orders
        # }), 200

        conn.commit()

        combined_order_code = ", ".join(created_orders)

        send_order_receipt_email(
            to_email=session["user_email"],
            customer_name=session.get("user_name", "Customer"),
            order_code=combined_order_code,
            items=receipt_items,
            subtotal=grand_subtotal,
            gst=grand_gst,
            total=grand_total,
            payment_method=payment_method,
            delivery_date=latest_delivery_date
        )

        return jsonify({
            "message": "Order placed successfully",
            "orders": created_orders
        }), 200

    # except Exception as e:
    #     conn.rollback()
    #     print("PLACE ORDER ERROR:", str(e))
    #     return jsonify({"error": "Order failed", "details": str(e)}), 500
    #     print("PLACE ORDER ERROR:", str(e))

    except Exception as e:
        conn.rollback()
        print("PLACE ORDER ERROR:", str(e))
        return jsonify({"error": "Order failed", "details": str(e)}), 500
    finally:
        cur.close()
        conn.close()

@app.route("/request-return", methods=["POST"])
@login_required
def request_return():

    data = request.get_json() or {}

    order_item_id = data.get("order_item_id")

    if not order_item_id:
        return jsonify({
            "message": "order_item_id is required"
        }), 400

    try:

        auto_complete_returns()

        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        # already requested?
        cur.execute("""
            SELECT return_id
            FROM returns
            WHERE order_item_id = %s
              AND status = 'IN_RETURNING_PROCESS'
        """, (order_item_id,))

        if cur.fetchone():
            cur.close()
            conn.close()

            return jsonify({
                "message": "Return already requested for this product"
            }), 400

        cur.execute("""
            SELECT
                oi.order_item_id,
                oi.product_id,
                oi.product_name,
                oi.image_link,
                o.user_id,
                o.order_status
            FROM order_items oi
            JOIN orders o
                ON oi.order_id = o.order_id
            WHERE oi.order_item_id = %s
              AND o.user_id = %s
        """, (
            order_item_id,
            session["user_id"]
        ))

        item = cur.fetchone()

        if not item:
            cur.close()
            conn.close()

            return jsonify({
                "message": "Order item not found"
            }), 404

        if item["order_status"] != "Delivered":
            cur.close()
            conn.close()

            return jsonify({
                "message": "Only delivered products can be returned"
            }), 400

        cur.execute("""
            INSERT INTO returns (
                order_item_id,
                product_id,
                user_id,
                product_name,
                img,
                request_date,
                status
            )
            VALUES (
                %s,
                %s,
                %s,
                %s,
                %s,
                CURRENT_TIMESTAMP,
                'IN_RETURNING_PROCESS'
            )
            RETURNING return_id
        """, (
            item["order_item_id"],
            item["product_id"],
            session["user_id"],
            item["product_name"],
            item["image_link"]
        ))

        return_id = cur.fetchone()["return_id"]

        conn.commit()

        cur.close()
        conn.close()

        return jsonify({
            "message": "Return request submitted successfully",
            "return_id": return_id
        })

    except Exception as e:
        return jsonify({
            "message": str(e)
        }), 500

@app.route("/return-products", methods=["GET"])
@login_required
def get_return_products():

    try:

        auto_complete_returns()

        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        cur.execute("""
            SELECT
                return_id,
                order_item_id,
                product_id,
                product_name,
                img,
                request_date,
                returned_date,
                status
            FROM returns
            WHERE user_id = %s
              AND status = 'IN_RETURNING_PROCESS'
            ORDER BY request_date DESC
        """, (session["user_id"],))

        rows = cur.fetchall()

        cur.close()
        conn.close()

        return jsonify(rows)

    except Exception as e:
        return jsonify({
            "message": str(e)
        }), 500

# ============================================================
# ADMIN
# ============================================================

# @app.route("/api/stats", methods=["GET"])
# @login_required
# def get_stats():
#     if session.get("role") != "admin":
#         return jsonify({"error": "Admin access required"}), 403

#     pending = sum(1 for o in orders if o["status"] == "Pending")
#     returns = sum(1 for o in orders if o["status"] == "Returned")

#     return jsonify({
#         "total_users":  len(users),
#         "total_posts":  len(orders),
#         "approvals":    len(orders) - pending,
#         "returns":      returns,
#     })

@app.route("/api/stats", methods=["GET"])
@login_required
def get_stats():
    if session.get("role") != "admin":
        return jsonify({"error": "Admin access required"}), 403

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        cur.execute("""SELECT COUNT(*) AS total_users
                     FROM users 
                    WHERE role = 'user'""")
        total_users = cur.fetchone()["total_users"]

        cur.execute("SELECT COUNT(*) AS total_products FROM products")
        total_products = cur.fetchone()["total_products"]

        cur.execute("""
            SELECT COUNT(*) AS pending_orders
            FROM orders
            WHERE order_status IN ('Pending', 'Placed', 'Yet to be Delivered')
        """)
        pending_orders = cur.fetchone()["pending_orders"]

        cur.execute("""
            SELECT COUNT(*) AS delivered_orders
            FROM orders
            WHERE order_status = 'Delivered'
        """)
        delivered_orders = cur.fetchone()["delivered_orders"]

        cur.execute("""
            SELECT COUNT(*) AS total_returns
            FROM returns
            WHERE status = 'IN_RETURNING_PROCESS'
        """)
        total_returns = cur.fetchone()["total_returns"]

        return jsonify({
            "total_users": total_users,
            "total_posts": total_products,
            "approvals": delivered_orders,
            "returns": total_returns
        }), 200

    except Exception as e:
        return jsonify({"error": "Failed to fetch stats", "details": str(e)}), 500

    finally:
        cur.close()
        conn.close()

# @app.route("/api/category-stats", methods=["GET"])
# @login_required
# def category_stats():
#     if session.get("role") != "admin":
#         return jsonify({"error": "Admin access required"}), 403

#     sales = {}
#     for order in orders:
#         for item in order.get("items", []):
#             product = find_product(item["product_id"])
#             if product:
#                 cat = product["category"]
#                 sales[cat] = sales.get(cat, 0) + item["quantity"]

#     total = sum(sales.values()) or 1
#     result = [
#         {"category": cat.capitalize(), "percent": round((qty / total) * 100, 1)}
#         for cat, qty in sales.items()
#     ]
#     return jsonify(result)

@app.route("/api/admin/users-summary", methods=["GET"])
@login_required
def admin_users_summary():
    if session.get("role") != "admin":
        return jsonify({"error": "Admin access required"}), 403

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        cur.execute("""
            SELECT
                u.user_id,
                u.username,
                u.email,
                u.phone_no,
                u.city,
                u.joined_on,
                COALESCE(order_counts.total_orders, 0) AS total_orders,
                last_order.order_id AS last_order_id,
                last_order.created_at AS last_order_date,
                last_order.order_status AS last_order_status
            FROM users u

            LEFT JOIN (
                SELECT
                    user_id,
                    COUNT(*) AS total_orders
                FROM orders
                WHERE user_id IS NOT NULL
                GROUP BY user_id
            ) AS order_counts
            ON u.user_id = order_counts.user_id

            LEFT JOIN (
                SELECT DISTINCT ON (user_id)
                    user_id,
                    order_id,
                    created_at,
                    order_status
                FROM orders
                WHERE user_id IS NOT NULL
                ORDER BY user_id, created_at DESC, order_id DESC
            ) AS last_order
            ON u.user_id = last_order.user_id

            WHERE u.role = 'user'
            ORDER BY u.joined_on DESC, u.user_id DESC
        """)

        rows = cur.fetchall()
        return jsonify(rows), 200

    except Exception as e:
        return jsonify({
            "error": "Failed to fetch user summary",
            "details": str(e)
        }), 500

    finally:
        cur.close()
        conn.close()

@app.route("/api/category-stats", methods=["GET"])
@login_required
def category_stats():
    if session.get("role") != "admin":
        return jsonify({"error": "Admin access required"}), 403

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        cur.execute("""
            SELECT
                p.category_id,
                SUM(oi.quantity) AS total_qty
            FROM order_items oi
            JOIN products p ON oi.product_id = p.product_id
            GROUP BY p.category_id
        """)
        rows = cur.fetchall()

        # sales = {}
        # total = 0

        # for row in rows:
        #     category_name = CATEGORY_NAME_BY_ID.get(row["category_id"], "unknown")
        #     qty = int(row["total_qty"] or 0)
        #     sales[category_name] = qty
        #     total += qty

        # total = total or 1

        # result = [
        #     {
        #         "category": cat.capitalize(),
        #         "percent": round((qty / total) * 100, 1)
        #     }
        #     for cat, qty in sales.items()
        # ]
        all_categories = {
            "anime": 0,
            "games": 0,
            "movies": 0,
            "series": 0,
            "kpop": 0,
            "pop": 0
        }

        total = 0

        for row in rows:
            category_name = CATEGORY_NAME_BY_ID.get(row["category_id"], "unknown")
            qty = int(row["total_qty"] or 0)
            if category_name in all_categories:
                all_categories[category_name] = qty
                total += qty

        total = total or 1

        result = [
            {
                "category": cat.capitalize(),
                "percent": round((qty / total) * 100, 1)
            }
            for cat, qty in all_categories.items()
        ]
        return jsonify(result), 200

    except Exception as e:
        return jsonify({"error": "Failed to fetch category stats", "details": str(e)}), 500

    finally:
        cur.close()
        conn.close()
        
# @app.route("/api/admin/products", methods=["POST"])
# @login_required
# def add_product_admin():
#     if session.get("role") != "admin":
#         return jsonify({"error": "Admin only"}), 403

#     data = request.get_json()

#     conn = get_db_connection()
#     cur = conn.cursor()

#     try:
#         category_name = data.get("category", "").lower()

#         category_id = CATEGORY_MAP.get(category_name)
#         if not category_id:
#             return jsonify({"error": "Invalid category"}), 400

#         cur.execute("""
#             INSERT INTO products (
#                 product_name, description, price, stock,
#                 category_id, key_words, mrp, discount,
#                 rating, reviews, image_link,
#                 ideal_for, specifications,
#                 is_new, is_popular, is_recommended, show_on_home
#             )
#             VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
#         """, (
#             data.get("name"),
#             data.get("description"),
#             data.get("price"),
#             data.get("stock"),
#             category_id,
#             data.get("keywords"),
#             data.get("mrp"),
#             data.get("discount"),
#             data.get("rating"),
#             data.get("reviews"),
#             data.get("image"),
#             data.get("ideal_for"),
#             data.get("specifications"),
#             data.get("is_new"),
#             data.get("is_popular"),
#             data.get("is_recommended"),
#             data.get("show_on_home")
#         ))

#         conn.commit()

#         return jsonify({"message": "Product added"}), 201

#     except Exception as e:
#         conn.rollback()
#         return jsonify({"error": str(e)}), 500

#     finally:
#         cur.close()
#         conn.close()

# @app.route("/api/admin/products", methods=["POST"])
# @login_required
# def add_product_admin():
#     if session.get("role") != "admin":
#         return jsonify({"error": "Admin access required"}), 403

#     try:
#         product_name = request.form.get("product_name", "").strip()
#         description = request.form.get("description", "").strip()
#         key_words = request.form.get("key_words", "").strip()
#         specifications = request.form.get("specifications", "").strip()
#         ideal_for = request.form.get("ideal_for", "").strip()
#         price = request.form.get("price", "").strip()
#         mrp = request.form.get("mrp", "").strip()
#         discount = request.form.get("discount", "").strip()
#         rating = request.form.get("rating", "").strip()
#         reviews = request.form.get("reviews", "").strip()
#         stock = request.form.get("stock", "").strip()
#         category = request.form.get("category", "").strip().lower()

#         is_new = request.form.get("is_new", "false").lower() == "true"
#         is_popular = request.form.get("is_popular", "false").lower() == "true"
#         is_recommended = request.form.get("is_recommended", "false").lower() == "true"
#         show_on_home = request.form.get("show_on_home", "false").lower() == "true"

#         if not product_name:
#             return jsonify({"error": "Product name is required"}), 400

#         if not price:
#             return jsonify({"error": "Price is required"}), 400

#         if not stock:
#             return jsonify({"error": "Stock is required"}), 400

#         if not category:
#             return jsonify({"error": "Category is required"}), 400

#         category_id = CATEGORY_MAP.get(category)
#         if not category_id:
#             return jsonify({"error": "Invalid category"}), 400

#         image_file = request.files.get("image")
#         if not image_file or image_file.filename == "":
#             return jsonify({"error": "Product image is required"}), 400

#         if not allowed_file(image_file.filename):
#             return jsonify({"error": "Only png, jpg, jpeg, webp images are allowed"}), 400

#         safe_name = secure_filename(image_file.filename)
#         unique_name = f"{int(datetime.now().timestamp())}_{safe_name}"
#         save_path = os.path.join(UPLOAD_FOLDER, unique_name)
#         image_file.save(save_path)

#         image_link = f"../images/products/admin_uploads/{unique_name}"

#         conn = get_db_connection()
#         cur = conn.cursor(cursor_factory=RealDictCursor)

#         cur.execute("""
#             INSERT INTO products (
#                 product_name,
#                 category_id,
#                 key_words,
#                 description,
#                 specifications,
#                 ideal_for,
#                 price,
#                 mrp,
#                 discount,
#                 rating,
#                 reviews,
#                 image_link,
#                 stock,
#                 is_new,
#                 is_popular,
#                 is_recommended,
#                 show_on_home
#             )
#             VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
#             RETURNING product_id
#         """, (
#             product_name,
#             category_id,
#             key_words,
#             description,
#             specifications,
#             ideal_for,
#             float(price) if price else 0,
#             float(mrp) if mrp else 0,
#             int(discount) if discount else 0,
#             float(rating) if rating else 0,
#             int(reviews) if reviews else 0,
#             image_link,
#             int(stock) if stock else 0,
#             is_new,
#             is_popular,
#             is_recommended,
#             show_on_home
#         ))

#         new_product = cur.fetchone()
#         conn.commit()

#         cur.close()
#         conn.close()

#         return jsonify({
#             "message": "Product added successfully",
#             "product_id": new_product["product_id"],
#             "image_link": image_link
#         }), 201

#     except Exception as e:
#         try:
#             conn.rollback()
#             cur.close()
#             conn.close()
#         except Exception:
#             pass
#         return jsonify({
#             "error": "Failed to add product",
#             "details": str(e)
#         }), 500

@app.route("/api/admin/products", methods=["POST"])
@login_required
def add_product_admin():
    if session.get("role") != "admin":
        return jsonify({"error": "Admin access required"}), 403

    conn = None
    cur = None

    try:
        product_name = request.form.get("product_name", "").strip()
        description = request.form.get("description", "").strip()
        key_words = request.form.get("key_words", "").strip()
        specifications = request.form.get("specifications", "").strip()
        ideal_for = request.form.get("ideal_for", "").strip()
        price = request.form.get("price", "").strip()
        mrp = request.form.get("mrp", "").strip()
        discount = request.form.get("discount", "").strip()
        rating = request.form.get("rating", "").strip()
        reviews = request.form.get("reviews", "").strip()
        stock = request.form.get("stock", "").strip()
        category = request.form.get("category", "").strip().lower()

        is_new = request.form.get("is_new", "false").lower() == "true"
        is_popular = request.form.get("is_popular", "false").lower() == "true"
        is_recommended = request.form.get("is_recommended", "false").lower() == "true"
        show_on_home = request.form.get("show_on_home", "false").lower() == "true"

        if not product_name:
            return jsonify({"error": "Product name is required"}), 400

        if not price:
            return jsonify({"error": "Price is required"}), 400

        if not stock:
            return jsonify({"error": "Stock is required"}), 400

        if not category:
            return jsonify({"error": "Category is required"}), 400

        category_id = CATEGORY_MAP.get(category)
        if not category_id:
            return jsonify({"error": "Invalid category"}), 400

        image_file = request.files.get("image")
        if not image_file or image_file.filename == "":
            return jsonify({"error": "Product image is required"}), 400

        if not allowed_file(image_file.filename):
            return jsonify({"error": "Only png, jpg, jpeg, webp images are allowed"}), 400

        safe_name = secure_filename(image_file.filename)
        unique_name = f"{int(datetime.now().timestamp())}_{safe_name}"
        save_path = os.path.join(UPLOAD_FOLDER, unique_name)
        image_file.save(save_path)

        image_link = f"../images/products/admin_uploads/{unique_name}"

        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        cur.execute("""
            INSERT INTO products (
                product_name,
                category_id,
                key_words,
                description,
                specifications,
                ideal_for,
                price,
                mrp,
                discount,
                rating,
                reviews,
                image_link,
                stock,
                is_new,
                is_popular,
                is_recommended,
                show_on_home
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING product_id
        """, (
            product_name,
            category_id,
            key_words,
            description,
            specifications,
            ideal_for,
            float(price) if price else 0,
            float(mrp) if mrp else 0,
            int(discount) if discount else 0,
            float(rating) if rating else 0,
            int(reviews) if reviews else 0,
            image_link,
            int(stock) if stock else 0,
            is_new,
            is_popular,
            is_recommended,
            show_on_home
        ))

        new_product = cur.fetchone()
        conn.commit()

        return jsonify({
            "message": "Product added successfully",
            "product_id": new_product["product_id"],
            "image_link": image_link
        }), 201

    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({
            "error": "Failed to add product",
            "details": str(e)
        }), 500

    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

@app.route("/api/admin/dashboard-products", methods=["GET"])
@login_required
def admin_dashboard_products():
    if session.get("role") != "admin":
        return jsonify({"error": "Admin access required"}), 403

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        cur.execute("""
            SELECT
                product_id,
                product_name,
                image_link
            FROM products
            ORDER BY product_id DESC
            LIMIT 3
        """)
        rows = cur.fetchall()
        return jsonify(rows), 200

    except Exception as e:
        return jsonify({
            "error": "Failed to fetch dashboard products",
            "details": str(e)
        }), 500

    finally:
        cur.close()
        conn.close()

@app.route("/api/admin/dashboard-users", methods=["GET"])
@login_required
def admin_dashboard_users():
    if session.get("role") != "admin":
        return jsonify({"error": "Admin access required"}), 403

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        cur.execute("""
            SELECT
                u.email,
                last_order.order_id,
                COALESCE(last_order.order_status, 'No Orders') AS order_status
            FROM users u
            LEFT JOIN (
                SELECT DISTINCT ON (user_id)
                    user_id,
                    order_id,
                    order_status,
                    created_at
                FROM orders
                WHERE user_id IS NOT NULL
                ORDER BY user_id, created_at DESC, order_id DESC
            ) AS last_order
            ON u.user_id = last_order.user_id
            WHERE u.role = 'user'
            ORDER BY u.joined_on DESC, u.user_id DESC
            LIMIT 6
        """)
        rows = cur.fetchall()
        return jsonify(rows), 200

    except Exception as e:
        return jsonify({
            "error": "Failed to fetch dashboard users",
            "details": str(e)
        }), 500

    finally:
        cur.close()
        conn.close()

@app.route("/api/admin/categories", methods=["GET"])
@login_required
def get_categories_admin():
    if session.get("role") != "admin":
        return jsonify({"error": "Admin only"}), 403

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        cur.execute("""
            SELECT category_id, category_name, parent_category_id
            FROM categories
            ORDER BY category_id ASC
        """)
        rows = cur.fetchall()
        return jsonify(rows), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cur.close()
        conn.close()

@app.route("/api/admin/categories", methods=["POST"])
@login_required
def add_category_admin():
    if session.get("role") != "admin":
        return jsonify({"error": "Admin only"}), 403

    data = request.get_json()

    name = data.get("category_name")
    parent_id = data.get("parent_category_id")

    if not name:
        return jsonify({"error": "Category name required"}), 400

    conn = get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute("""
            INSERT INTO categories (category_name, parent_category_id)
            VALUES (%s, %s)
        """, (name, parent_id if parent_id else None))

        conn.commit()
        return jsonify({"message": "Category added"}), 201

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500

    finally:
        cur.close()
        conn.close()

# ============================================================
# RUN
# ============================================================

if __name__ == "__main__":
    print("\nFanFinity backend starting...")
    print(f"Project root : {PROJECT_ROOT}")
    print("Products source : PostgreSQL database")
    print("Open http://127.0.0.1:5000 in your browser\n")
    app.run(debug=True)