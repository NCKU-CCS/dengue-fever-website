from lib import csv_io

data = csv_io.req_csv('https://dl.dropboxusercontent.com/u/13580830/Tainan/Tainan_shp/103年12月臺南市統計區人口統計_最小統計區.csv', 'big5')
csv_io.write_csv('population.csv', data)
