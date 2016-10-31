from lib import csv_io
from lib import json_io
from datetime import datetime
from datetime import timedelta
from datetime import date

def sum_range(data, from_date, end_date):
    now = datetime.strptime(from_date, '%Y/%m/%d').date()
    end = datetime.strptime(end_date, '%Y/%m/%d').date()
    count = 0.0
    for row in data:
        d = datetime.strptime(row[1], '%Y/%m/%d').date()
        if d > now and d < end:
            count += 1.0
    return count

dengue = csv_io.read_csv('../data/dengue_small_region.csv')
dengue = dengue[0:]

data = {}
for row in dengue:
    if row[1] == '日期':
        continue

    if row[-3] not in data:
        data[row[-3]] = []
    data[row[-3]].append(row)

new_data = {}
count = 0
for region in data:
    sum_before1 = sum_range(data[region], '2015/08/01', '2015/08/13')
    sum_before1_avg = sum_before1 / 12

    sum_after1 = sum_range(data[region], '2015/08/14', '2015/08/26')
    sum_after1_avg = sum_after1 / 12

    sum_before2 = sum_range(data[region], '2015/08/21', '2015/08/28')
    sum_before2_avg = sum_before2 / 7

    sum_after2 = sum_range(data[region], '2015/08/29', '2015/09/06')
    sum_after2_avg = sum_after2 / 7

    if (sum_after1_avg - sum_before1_avg) > 0.1 and sum_after2_avg > sum_before2_avg:
        count += 1
        new_data[region] = {}
        new_data[region]['dengue'] = len(data[region])
        new_data[region]['region'] = data[region][0][-5]
        new_data[region]['village'] = data[region][0][-4]

        if (sum_before1 + sum_before2) != 0:
            new_data[region]['ratio'] = (sum_after1 + sum_after2)/(sum_before1 + sum_before2)
        else:
            new_data[region]['ratio'] = ''

print (count)
json_io.write_json('../data/tainan_rain_rise_region.json', new_data)
