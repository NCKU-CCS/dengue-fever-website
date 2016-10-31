from lib import csv_io
from lib import json_io
from datetime import datetime
from datetime import timedelta
from datetime import date

dengue = csv_io.read_csv('../data/dengue_small_region.csv')
dengue = dengue[1:]

data = {}
for row in dengue:
    if row[-5] not in data:
        data[row[-5]] = {}
    age = row[2].replace('+', '').split('-')

    if len(age) == 2:
        age1, age2 = age
        age1 = int(age1)
        age2 = int(age2)
        if 0 <= age1 and age2 < 20:
            if '0-20' in data[row[-5]]:
                data[row[-5]]['0-20'] += 1
            else:
                data[row[-5]]['0-20'] = 1
        elif age2 <= 40:
            if '20-40' in data[row[-5]]:
                data[row[-5]]['20-40'] += 1
            else:
                data[row[-5]]['20-40'] = 1
        elif age2 <= 60:
            if '20-40' in data[row[-5]]:
                data[row[-5]]['20-40'] += 1
            else:
                data[row[-5]]['20-40'] = 1
        else:
            if '>60' in data[row[-5]]:
                data[row[-5]]['>60'] += 1
            else:
                data[row[-5]]['>60'] = 1
    else:
        age = int(age[0])
        if age < 20:
            if '0-20' in data[row[-5]]:
                data[row[-5]]['0-20'] += 1
            else:
                data[row[-5]]['0-20'] = 1
        elif age < 40:
            if '20-40' in data[row[-5]]:
                data[row[-5]]['20-40'] += 1
            else:
                data[row[-5]]['20-40'] = 1
        elif age < 60:
            if '40-60' in data[row[-5]]:
                data[row[-5]]['40-60'] += 1
            else:
                data[row[-5]]['40-60'] = 1
        else:
            if '>60' in data[row[-5]]:
                data[row[-5]]['>60'] += 1
            else:
                data[row[-5]]['>60'] = 1

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



csv_io.write_csv('../data/tainan_dengue_age.csv', new_data)
