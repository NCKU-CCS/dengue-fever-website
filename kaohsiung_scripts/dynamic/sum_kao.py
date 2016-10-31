from lib import json_io
from datetime import datetime
from datetime import timedelta
from datetime import date

data =json_io.read_json('../../data/2014_kao_bar_data.json')
s = datetime.strptime('2014/10/20', '%Y/%m/%d').date()
e = datetime.strptime('2014/11/7', '%Y/%m/%d').date()

t = 0
for row in data:
    d = datetime.strptime(row['date'], '%Y/%m/%d').date()
    if d > s and d < e:
        t += row['value']
        print (row['date'])
print (t)

