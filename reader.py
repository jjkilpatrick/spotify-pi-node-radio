import serial
import logging
serial = serial.Serial("/dev/ttyACM0", baudrate=9600)
logging.basicConfig(level=logging.DEBUG)

from socketIO_client import SocketIO

with SocketIO('192.168.1.20', 8889) as socketIO:
    socketIO.emit('aaa')
    socketIO.wait(seconds=1)

code = ''

while True:
    data = serial.read()
    if data == '\r':
	code = code[:-3]
        print(code)
        code = ''
    else:
        code = code + data
