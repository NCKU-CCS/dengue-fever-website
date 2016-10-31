from lib import csv_io
from lib import json_io
from datetime import datetime
from datetime import timedelta
from datetime import date

dengue = csv_io.read_csv('../data/tainan_population.csv')
header = dengue[0]
dengue = dengue[1:]

data = {}
for row in dengue:
    if row[1] not in data:
        data[row[1]] = {}

    for i in range(7, len(row)):
        d = str(header[i])
        age = d.replace('歲', '').replace('-', '').replace('男', '').replace('女', '').replace('以上', '')
        age = int(age)
        number = int(row[i])
        if age < 20:
            if '0-20' in data[row[1]]:
                data[row[1]]['0-20'] += number
            else:
                data[row[1]]['0-20'] = number
        elif age < 40:
            if '20-40' in data[row[1]]:
                data[row[1]]['20-40'] += number
            else:
                data[row[1]]['20-40'] = number
        elif age < 60:
            if '40-60' in data[row[1]]:
                data[row[1]]['40-60'] += number
            else:
                data[row[1]]['40-60'] = number
        else:
            if '>60' in data[row[1]]:
                data[row[1]]['>60'] += number
            else:
                data[row[1]]['>60'] = number

new_data = [['區別', '0-20', '20-40', '40-60', '>60']]
for region in data:
    d = data[region]
    if '0-20' not in d:
        d['0-20'] = 0
    if '20-40' not in d:
        d['20-40'] = 0
    if '40-60' not in d:
        d['40-60'] = 0
    if '>60' not in d:
        d['>60'] = 0

    new_data.append([region, d['0-20'], d['20-40'], d['40-60'], d['>60']])

print ('done')
csv_io.write_csv('../data/tainan_age.csv', new_data)
