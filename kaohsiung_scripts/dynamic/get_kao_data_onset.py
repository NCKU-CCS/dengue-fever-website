#! /usr/bin/env python
# -*- coding: utf-8 -*-
import json
import os
from bs4 import BeautifulSoup
import requests
import csv
import sys
from datetime import datetime
from datetime import timedelta
from datetime import date
from lib import csv_io
from lib import json_io

data = csv_io.req_csv('http://data.gov.tw/iisi/logaccess/16702?dataUrl=http://nidss.cdc.gov.tw/download/Dengue_Daily.csv&ndctype=CSV&ndcnid=21025', 'utf-8')
header = data[0]
data = data[1:]
new_data = []
kao_data = []
start = False
for row in data:
    if (row[0] and ('2015' not in row[0]) and row[5] == '台南市'):
        new_data.append([row[0], row[9], row[10]])
        kao_data.append(row)

new_data = sorted(new_data, key = lambda x: datetime.strptime(x[0], '%Y/%m/%d').date())
new_data.insert(0,['日期','Longitude', 'Latitude'])

kao_data.insert(0, header)
csv_io.write_csv('./dengue_onset.csv', new_data)
