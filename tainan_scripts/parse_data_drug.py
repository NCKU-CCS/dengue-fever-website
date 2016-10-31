#!/usr/bin/env python2.7
# -*- coding: utf-8 -*-
import requests
from datetime import datetime
from geopy.distance import vincenty
from lib import csv_io
from lib import json_io

def filter_data(input_):
    data = []
    for item in input_:
        data.append([item[4], item[8], item[9]])
    header = ['日期', 'Latitude', 'Longitude']
    return data, header

if __name__ == '__main__':
    url = 'http://denguefever.csie.ncku.edu.tw/file/drug_all.csv'
    data = csv_io.req_csv(url, 'utf-8')
    data, header = filter_data(data)
    data = data[1:] 
    dengue_data = csv_io.read_csv('../data/seven_data.csv')

    tmp = dengue_data[-1][1]
    now = datetime.strptime(tmp, '%Y/%m/%d').date()
    data_2015 = [header]
    print (now, data[0])
    new_data = [header]
    for row in data:
        event_date = datetime.strptime('2015年'+row[0], '%Y年%m月%d日').date()
        row[-1], row[-2] = float(row[-1]), float(row[-2])
        data_2015.append(row)
        if now < event_date:
            continue
        delta = (now-event_date)
        if delta.days < 7:
            new_data.append(row)

    csv_io.write_csv('../data/drug_seven.csv', new_data)
    csv_io.write_csv('../data/drug_2015.csv', data_2015)
