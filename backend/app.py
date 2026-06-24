from flask import Flask, jsonify, request
from flask_cors import CORS
import pymysql

app = Flask(__name__)
CORS(app)

def get_connection():
    return pymysql.connect(
        host="127.0.0.1",
        user="root",
        password="",
        database="smart_city",
        port=3307
    )

@app.route('/')
def home():
    return "Smart City Backend Running Successfully"

# Traffic Data API
@app.route('/traffic')
def traffic():

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM traffic_data")
    data = cursor.fetchall()

    conn.close()

    return jsonify(data)

# Parking Slots API
@app.route('/parking')
def parking():

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM parking_slots")
    data = cursor.fetchall()

    conn.close()

    return jsonify(data)

# Routes API
@app.route('/routes')
def routes():

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM routes")
    data = cursor.fetchall()

    conn.close()

    return jsonify(data)

# Parking Locations For Map
@app.route('/parking-map')
def parking_map():

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM parking_locations")
    data = cursor.fetchall()

    conn.close()

    return jsonify(data)

# Junction Locations For Map
@app.route('/junctions')
def junctions():

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM junctions")
    data = cursor.fetchall()

    conn.close()

    return jsonify(data)
@app.route('/traffic-data')
def traffic_data():

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM traffic_data")
    data = cursor.fetchall()

    conn.close()

    return jsonify(data)

# Book Parking Slot API
@app.route('/book-parking', methods=['POST'])
def book_parking():
    try:
        data = request.get_json() or {}
        parking_id = data.get('parking_id')
        if not parking_id:
            parking_id = request.args.get('parking_id')

        if not parking_id:
            return jsonify({"success": False, "error": "Missing parking_id parameter"}), 400

        conn = get_connection()
        cursor = conn.cursor()

        # Check availability
        cursor.execute("SELECT name, available_slots FROM parking_locations WHERE id = %s", (parking_id,))
        parking_info = cursor.fetchone()

        if not parking_info:
            conn.close()
            return jsonify({"success": False, "error": f"Parking location with ID {parking_id} not found"}), 404

        parking_name, available_slots = parking_info

        if available_slots <= 0:
            conn.close()
            return jsonify({"success": False, "error": "No slots available at this location"}), 400

        # Decrement slot
        new_slots = available_slots - 1
        cursor.execute("UPDATE parking_locations SET available_slots = %s WHERE id = %s", (new_slots, parking_id))
        conn.commit()
        conn.close()

        # Generate a mock booking ID
        import random
        booking_ticket = f"PK-{random.randint(1000, 9999)}"

        return jsonify({
            "success": True,
            "message": f"Successfully booked slot at {parking_name}!",
            "ticket": booking_ticket,
            "parking_name": parking_name,
            "available_slots": new_slots
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)