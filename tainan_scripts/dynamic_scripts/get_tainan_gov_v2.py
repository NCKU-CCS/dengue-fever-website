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
data = data[1:]
new_data = []
start = False
for row in data:
    if (row[1] and '2015' in row[1] and row[5] == '台南市'):
        new_data.append([row[5], row[1], row[6], row[7], row[9], row[10]])

new_data = sorted(new_data, key = lambda x: datetime.strptime(x[1], '%Y/%m/%d').date())
new_data.insert(0, ['居住縣市','日期','區別','里別','Latitude','Longitude'])
csv_io.write_csv('../data/dengue_all_v4.csv', new_data)
