import serial
serial = serial.Serial("/dev/ttyACM0", baudrate=9600)

print('hello world')

code = ''

while True:
    data = serial.read()
    if data == '\r':
        print(code)
        code = ''
    else:
        code = code + data
