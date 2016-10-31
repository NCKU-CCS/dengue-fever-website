#!/usr/bin/env python2.7
# -*- coding: utf-8 -*-
import requests
import sys
from datetime import datetime
from datetime import timedelta
from datetime import date
from lib import csv_io
from lib import json_io

url = 'http://denguefever.csie.ncku.edu.tw/file/dengue_all.csv'
tmp = csv_io.req_csv(url, 'utf-8')
data = []
for item in tmp:
    if item[4] and item[-1]:
        item[4] = '2015/'+item[4].replace('月', '/').replace('日', '')
        data.append([item[0], item[4], item[1], item[2], item[-1], item[-2]])

header = data[0]
data = data[1:]
data = sorted(data, key = lambda x: datetime.strptime(x[1], '%Y/%m/%d').date())
now = datetime.strptime(data[-1][1], '%Y/%m/%d').date()

header[1], header[2], header[-2], header[-1] = '日期', '區別', 'Latitude', 'Longitude'
header[3] = '里別'
data.insert(0, header)
csv_io.write_csv('../data/dengue_all_v3.csv', data)
