from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
from datetime import datetime
import re
import bcrypt
import jwt

app = Flask(__name__)
CORS(app)

SECRET_KEY = 'your_secret_key_here'

def init_db():
    conn = sqlite3.connect('patients.db')
    db_cursor = conn.cursor()

    # Create patients table if not exists
    db_cursor.execute('''
        CREATE TABLE IF NOT EXISTS patients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT NOT NULL,
            age INTEGER NOT NULL,
            gender TEXT NOT NULL,
            contact_number TEXT NOT NULL,
            email TEXT NOT NULL,
            patient_code TEXT NOT NULL UNIQUE,
            address TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Create tests table if not exists
    db_cursor.execute('''
        CREATE TABLE IF NOT EXISTS tests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_id INTEGER NOT NULL,
            test_category TEXT NOT NULL,
            test_name TEXT NOT NULL,
            test_value REAL NOT NULL,
            normal_range TEXT NOT NULL,
            unit TEXT NOT NULL,
            additional_note TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (patient_id) REFERENCES patients (id)
        )
    ''')

    # Create labs table if not exists
    db_cursor.execute('''
        CREATE TABLE IF NOT EXISTS labs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            slogan TEXT,
            address TEXT NOT NULL,
            phone TEXT NOT NULL,
            email TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    conn.commit()
    conn.close()

def init_user_table():
    conn = sqlite3.connect('patients.db')
    db_cursor = conn.cursor()
    db_cursor.execute('''CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
    )''')
    conn.commit()
    conn.close()

# Initialize database when the app starts
init_db()
init_user_table()

def fetch_patient_data_from_db(patient_code):
    conn = sqlite3.connect('patients.db')
    cursor = conn.cursor()

    # Query to fetch patient details
    query = """
    SELECT * FROM patients
    WHERE patient_code = ?
    """
    cursor.execute(query, (patient_code,))
    patient_data = cursor.fetchone()

    conn.close()

    if patient_data:
        # Convert the patient data to a dictionary
        columns = [column[0] for column in cursor.description]
        patient_data_dict = dict(zip(columns, patient_data))

        # Format the response without lab information
        response_data = {
            "report": {
                "patientName": patient_data_dict.get("full_name", ""),
                "patientAge": patient_data_dict.get("age", ""),
                "patientGender": patient_data_dict.get("gender", ""),
                "patientCode": patient_data_dict.get("patient_code", ""),
                "patientContact": patient_data_dict.get("contact_number", ""),
                "refBy": patient_data_dict.get("ref_by", ""),
                "labRefNo": patient_data_dict.get("lab_ref_no", ""),
            }
        }
        return response_data
    else:
        return None

@app.route('/api/patient-report/<patient_code>', methods=['GET'])
def get_patient_report(patient_code):
    patient_data = fetch_patient_data_from_db(patient_code)

    if patient_data:
        return jsonify(patient_data)
    else:
        return jsonify({"error": "Patient not found"}), 404

# Existing routes
@app.route('/api/patients', methods=['GET'])
def get_patients():
    conn = sqlite3.connect('patients.db')
    db_cursor = conn.cursor()

    db_cursor.execute('SELECT * FROM patients ORDER BY created_at DESC')
    patients = db_cursor.fetchall()
    conn.close()

    patient_list = []
    for patient in patients:
        patient_list.append({
            'id': patient[0],
            'fullName': patient[1],
            'age': patient[2],
            'gender': patient[3],
            'contactNumber': patient[4],
            'email': patient[5],
            'patientCode': patient[6],
            'address': patient[7],
            'createdAt': patient[8]
        })

    return jsonify(patient_list)

@app.route('/api/patients', methods=['POST'])
def add_patient():
    data = request.json

    required_fields = ['fullName', 'age', 'gender', 'contactNumber', 'email', 'patientCode', 'address']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400

    try:
        conn = sqlite3.connect('patients.db')
        db_cursor = conn.cursor()

        db_cursor.execute('''
            INSERT INTO patients (full_name, age, gender, contact_number, email, patient_code, address)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            data['fullName'],
            data['age'],
            data['gender'],
            data['contactNumber'],
            data['email'],
            data['patientCode'],
            data['address']
        ))
        conn.commit()
        conn.close()
        return jsonify({'message': 'Patient added successfully'}), 201
    except sqlite3.IntegrityError:
        return jsonify({'error': 'Patient code already exists'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/tests', methods=['GET'])
def get_tests():
    conn = sqlite3.connect('patients.db')
    db_cursor = conn.cursor()

    db_cursor.execute('''
        SELECT t.*, p.full_name, p.patient_code
        FROM tests t
        JOIN patients p ON t.patient_id = p.id
        ORDER BY t.created_at DESC
    ''')
    tests = db_cursor.fetchall()
    conn.close()

    test_list = []
    for test in tests:
        test_list.append({
            'id': test[0],
            'patientId': test[1],
            'patientName': test[9] if len(test) > 9 else "",
            'patientCode': test[10] if len(test) > 10 else "",
            'testCategory': test[2],
            'testName': test[3],
            'testValue': test[4],
            'normalRange': test[5],
            'unit': test[6],
            'additionalNote': test[7],
            'createdAt': test[8]
        })

    return jsonify(test_list)

@app.route('/api/tests', methods=['POST'])
def add_test():
    data = request.json

    required_fields = ['patientId', 'testCategory', 'testName', 'testValue', 'normalRange', 'unit']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400

    try:
        conn = sqlite3.connect('patients.db')
        db_cursor = conn.cursor()

        db_cursor.execute('''
            INSERT INTO tests (patient_id, test_category, test_name, test_value, normal_range, unit, additional_note)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            data['patientId'],
            data['testCategory'],
            data['testName'],
            data['testValue'],
            data['normalRange'],
            data['unit'],
            data.get('additionalNote', '')
        ))
        conn.commit()
        conn.close()
        return jsonify({'message': 'Test result added successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/tests/<int:test_id>', methods=['DELETE'])
def delete_test(test_id):
    try:
        conn = sqlite3.connect('patients.db')
        db_cursor = conn.cursor()
        db_cursor.execute('DELETE FROM tests WHERE id = ?', (test_id,))
        conn.commit()
        conn.close()
        return jsonify({'message': 'Test deleted successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/labs', methods=['GET'])
def get_labs():
    conn = sqlite3.connect('patients.db')
    db_cursor = conn.cursor()
    db_cursor.execute('SELECT * FROM labs ORDER BY created_at DESC')
    labs = db_cursor.fetchall()
    conn.close()
    lab_list = []
    for lab in labs:
        lab_list.append({
            'id': lab[0],
            'name': lab[1],
            'slogan': lab[2],
            'address': lab[3],
            'phone': lab[4],
            'email': lab[5],
            'createdAt': lab[6]
        })
    return jsonify(lab_list)

@app.route('/api/labs', methods=['POST'])
def add_lab():
    data = request.json
    required_fields = ['name', 'address', 'phone', 'email']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    try:
        conn = sqlite3.connect('patients.db')
        db_cursor = conn.cursor()
        db_cursor.execute('''
            INSERT INTO labs (name, slogan, address, phone, email)
            VALUES (?, ?, ?, ?, ?)
        ''', (
            data['name'],
            data.get('slogan', ''),
            data['address'],
            data['phone'],
            data['email']
        ))
        conn.commit()
        conn.close()
        return jsonify({'message': 'Lab added successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/reports/<int:patient_id>', methods=['GET'])
def generate_report(patient_id):
    try:
        conn = sqlite3.connect('patients.db')
        db_cursor = conn.cursor()

        db_cursor.execute('SELECT * FROM patients WHERE id = ?', (patient_id,))
        patient = db_cursor.fetchone()

        if not patient:
            return jsonify({'error': 'Patient not found'}), 404

        db_cursor.execute('''
            SELECT * FROM tests
            WHERE patient_id = ?
            ORDER BY created_at DESC
        ''', (patient_id,))
        tests = db_cursor.fetchall()

        conn.close()

        test_list = []
        for test in tests:
            value = test[4]
            ref_range = str(test[5])
            status = 'Normal'
            ref = ref_range.replace('–', '-').replace(' ', '')
            match = re.match(r'^(\d+(?:\.\d+)?)-(\d+(?:\.\d+)?)$', ref)
            if match:
                low, high = float(match.group(1)), float(match.group(2))
                if value < low:
                    status = 'Low'
                elif value > high:
                    status = 'High'
            elif ref.startswith('<'):
                try:
                    high = float(ref[1:])
                    if value >= high:
                        status = 'High'
                except:
                    pass
            elif ref.lower().startswith('upto') or ref.lower().startswith('up to'):
                try:
                    high = float(re.findall(r'\d+(?:\.\d+)?', ref)[0])
                    if value > high:
                        status = 'High'
                except:
                    pass

            test_list.append({
                'id': test[0],
                'testCategory': test[2],
                'testName': test[3],
                'testValue': value,
                'normalRange': test[5],
                'unit': test[6],
                'additionalNote': test[7],
                'createdAt': test[8],
                'status': status
            })

        report = {
            'patientName': patient[1],
            'patientCode': patient[6],
            'patientAge': patient[2],
            'patientGender': patient[3],
            'tests': test_list
        }

        return jsonify(report)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    if not email or not password or len(password) < 6:
        return jsonify({'error': 'Invalid email or password'}), 400
    hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    try:
        conn = sqlite3.connect('patients.db')
        db_cursor = conn.cursor()
        db_cursor.execute('INSERT INTO users (email, password) VALUES (?, ?)', (email, hashed))
        conn.commit()
        conn.close()
        return jsonify({'message': 'User registered successfully'})
    except sqlite3.IntegrityError:
        return jsonify({'error': 'Email already exists'}), 409
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    if not email or not password:
        return jsonify({'error': 'Missing email or password'}), 400
    conn = sqlite3.connect('patients.db')
    db_cursor = conn.cursor()
    db_cursor.execute('SELECT id, password FROM users WHERE email = ?', (email,))
    user = db_cursor.fetchone()
    if user:
        if bcrypt.checkpw(password.encode('utf-8'), user[1]):
            payload = {
                'user_id': user[0],
                'email': email,
                'exp': datetime.utcnow() + datetime.timedelta(days=1)
            }
            token = jwt.encode(payload, SECRET_KEY, algorithm='HS256')
            conn.close()
            return jsonify({'token': token, 'email': email})
        else:
            conn.close()
            return jsonify({'error': 'Invalid credentials'}), 401
    else:
        hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        db_cursor.execute('INSERT INTO users (email, password) VALUES (?, ?)', (email, hashed))
        user_id = db_cursor.lastrowid
        conn.commit()
        conn.close()
        payload = {
            'user_id': user_id,
            'email': email,
            'exp': datetime.utcnow() + datetime.timedelta(days=1)
        }
        token = jwt.encode(payload, SECRET_KEY, algorithm='HS256')
        return jsonify({'token': token, 'email': email})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
