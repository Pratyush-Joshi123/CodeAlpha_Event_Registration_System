
from flask import Flask, render_template, request, jsonify
import sqlite3
import re

app = Flask(__name__)

DATABASE = "database.db"

events = [
    {
        "id": 1,
        "name": "Python Workshop",
        "date": "2026-11-15",
        "venue": "Computer Lab",
        "seats": 30
    },
    {
        "id": 2,
        "name": "Web Development Seminar",
        "date": "2026-11-20",
        "venue": "College Auditorium",
        "seats": 50
    },
    {
        "id": 3,
        "name": "AI and Data Science Meetup",
        "date": "2026-11-25",
        "venue": "Seminar Hall",
        "seats": 40
    }
]


def get_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_connection()

    conn.execute("""
        CREATE TABLE IF NOT EXISTS registrations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            event_id INTEGER NOT NULL
        )
    """)

    conn.commit()
    conn.close()


def get_events_with_availability(conn):
    updated_events = []

    for event in events:
        registered = conn.execute(
            "SELECT COUNT(*) FROM registrations WHERE event_id = ?",
            (event["id"],)
        ).fetchone()[0]

        updated_events.append({
            **event,
            "seats": max(0, event["seats"] - registered),
            "capacity": event["seats"]
        })

    return updated_events


init_db()


# Keep the original Flask homepage working.
@app.route("/")
def home():
    conn = get_connection()

    try:
        updated_events = get_events_with_availability(conn)
    finally:
        conn.close()

    return render_template("index.html", events=updated_events)


# API: retrieve events and real remaining seats.
@app.route("/api/events", methods=["GET"])
def api_events():
    conn = get_connection()

    try:
        updated_events = get_events_with_availability(conn)
        return jsonify(updated_events)
    finally:
        conn.close()


def process_registration(data):
    name = str(data.get("name") or "").strip()
    email = str(data.get("email") or "").strip().lower()
    raw_event_id = data.get("event_id")

    if not name or not email or raw_event_id is None:
        return {"message": "Please fill in all fields."}, 400

    if len(name) > 100 or len(email) > 254:
        return {"message": "Name or email is too long."}, 400

    if not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", email):
        return {"message": "Please enter a valid email address."}, 400

    try:
        event_id = int(raw_event_id)
    except (ValueError, TypeError):
        return {"message": "Invalid event selected."}, 400

    selected_event = next(
        (event for event in events if event["id"] == event_id),
        None
    )

    if selected_event is None:
        return {"message": "Event not found."}, 404

    conn = get_connection()

    try:
        # Keep duplicate checks and seat checks together with the insert.
        conn.execute("BEGIN IMMEDIATE")

        duplicate = conn.execute(
            """
            SELECT id FROM registrations
            WHERE LOWER(email) = ? AND event_id = ?
            """,
            (email, event_id)
        ).fetchone()

        if duplicate:
            conn.rollback()
            return {
                "message": "You have already registered for this event!"
            }, 400

        registered = conn.execute(
            "SELECT COUNT(*) FROM registrations WHERE event_id = ?",
            (event_id,)
        ).fetchone()[0]

        if registered >= selected_event["seats"]:
            conn.rollback()
            return {"message": "Sorry, this event is full!"}, 400

        conn.execute(
            """
            INSERT INTO registrations (name, email, event_id)
            VALUES (?, ?, ?)
            """,
            (name, email, event_id)
        )

        conn.commit()

        return {
            "message": "Registration successful! Thank you for registering."
        }, 201

    except sqlite3.Error:
        conn.rollback()
        app.logger.exception("Registration database error")
        return {"message": "A database error occurred. Please try again."}, 500

    finally:
        conn.close()


# API: register from the React frontend.
@app.route("/api/register", methods=["POST"])
def api_register():
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({"message": "Invalid request data."}), 400

    result, status = process_registration(data)
    return jsonify(result), status


# Keep the original HTML registration endpoint working too.
@app.route("/register", methods=["POST"])
def register():
    result, status = process_registration(request.form)
    return result["message"], status


if __name__ == "__main__":
    app.run(debug=True)
