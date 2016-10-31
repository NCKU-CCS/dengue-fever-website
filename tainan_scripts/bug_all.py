#!/usr/bin/env python2.7
# -*- coding: utf-8 -*-
import requests
import csv
from datetime import datetime
from geopy.distance import vincenty
import json

def write_csv(file_name, content):
    """write csv"""
    with open(file_name, 'w') as output_file:
        writer = csv.writer(output_file)
        writer.writerows(content)

if __name__ == '__main__':
    r = requests.get('http://data.tainan.gov.tw/dataset/5855a005-1116-4e47-94c3-c9b3a05f6374/resource/c3de36ef-e294-40b7-b732-e2f2c48afd5b/download/1048.csv')
    r.encoding = 'utf-8'
    raw = r.text
    data = []
    for item in csv.reader(raw.splitlines()):
        # 編號, 日期, 區別
        data.append(item)
    
    print (data[-1])
    write_csv('../data/bug_all.csv', data)
