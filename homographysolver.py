import numpy as np
import argparse

#parser= argparse.ArgumentParser(prog='homography value calc', usage='%(prog)s -C realX realY screenX screenY  Needs 4 pairs')
#parser.add_argument ('-C', '--Coordinates', nargs=4, action='append',  required=True)

#cPairs = parser.parse_args().Coordinates
#print(cPairs)
#if len(cPairs) < 4:
#	print( cPairs)
#	raise Exception("Needs 4 coordinate pairs.")

A = np.zeros(64)
b = np.zeros(8)
#print (A)
#print (b)
cPairs = [(14,0,3,11), (12, 12, 0, 0), (132, 44, 135, 56), (20, 28, 78, 79)]
cPairs = [(14,24,131,19), (0, 24, 42, 28), (11, 12, 127, 80), (3, 12, 47, 83)]

for index, coordpair in enumerate(cPairs):
	coordpair = [float(obj) for obj in coordpair]
	b[index*2] = coordpair[0]
	b[(index * 2) +1] = coordpair[1]
	A[index*16:index*16+8] = [coordpair[2], coordpair[3], 1, 0, 0, 0, - coordpair[2] * coordpair[0],  - coordpair[3] * coordpair[0]]
	A[index*16+8:index*16+16] = [0, 0, 0, coordpair[2], coordpair[3], 1, - coordpair[2] * coordpair[1],  - coordpair[1] * coordpair[1]]
A = A.reshape([8,8])
b = b.reshape([8,1])

h = np.linalg.solve(A, b)
print(A)
print(b)
print(h)