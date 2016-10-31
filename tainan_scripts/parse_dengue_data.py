#!/usr/bin/env python2.7
# -*- coding: utf-8 -*-
import requests
import sys
from datetime import datetime
from datetime import timedelta
from datetime import date
from lib import csv_io
from lib import json_io
from lib import geo


def getDaysWithin(data):
    days1, days3, days5, days7 = [], [], [], []
    for item in data:
        event_date = datetime.strptime(item[1], '%Y/%m/%d').date()
        if event_date > now:
            break
        delta = now - event_date
        item[-1], item[-2] = float(item[-1]), float(item[-2])
        if delta.days < 7:
            tmp = list(item)
            if delta.days < 5:
                days5.append(item)
            if delta.days < 3:
                tmp.append('red')
                days3.append(item)
                if delta.days < 1:
                    days1.append(item)
            else:
                tmp.append('cadetblue')
            days7.append(tmp)

    return days1, days3, days5, days7

if __name__ == '__main__':
    url = 'http://denguefever.csie.ncku.edu.tw/file/dengue_all.csv'
    data = csv_io.req_csv(url, 'utf-8')
    output_data = {}
    now = datetime.strptime(data[-1][1], '%Y/%m/%d').date()

    header = data[0]
    header[1], header[2], header[-2], header[-1] = '日期', '區別', 'Latitude', 'Longitude'
    data = data[1:]
    days1, days3, days5, days7 = getDaysWithin(data)
    
    one_003_data = geo.get_hot_points(days1, len(days1)*0.03, 500)
    print ('......')
    one_0025_data = geo.get_hot_points(days1, len(days1)*0.025, 500)
    print ('......')
    one_002_data = geo.get_hot_points(days1, len(days1)*0.02, 500)
    print ('......')
    one_003_data.insert(0, header)
    one_0025_data.insert(0, header)
    one_002_data.insert(0, header)

    three_003_data = geo.get_hot_points(days3, len(days3)*0.03, 500)
    print ('......')
    three_0025_data = geo.get_hot_points(days3, len(days3)*0.025, 500)
    print ('......')
    three_002_data = geo.get_hot_points(days3, len(days3)*0.02, 500)
    print ('......')
    three_003_data.insert(0, header)
    three_0025_data.insert(0, header)
    three_002_data.insert(0, header)

    five_003_data = geo.get_hot_points(days5, len(days5)*0.03, 500)
    print ('......')
    five_0025_data = geo.get_hot_points(days5, len(days5)*0.025, 500)
    print ('......')
    five_002_data = geo.get_hot_points(days5, len(days5)*0.02, 500)
    print ('......')
    five_003_data.insert(0, header)
    five_0025_data.insert(0, header)
    five_002_data.insert(0, header)

    csv_io.write_csv('../data/one_002_data.csv', one_002_data)
    csv_io.write_csv('../data/three_002_data.csv', three_002_data)
    csv_io.write_csv('../data/five_002_data.csv', five_002_data)

    csv_io.write_csv('../data/one_0025_data.csv', one_0025_data)
    csv_io.write_csv('../data/three_0025_data.csv', three_0025_data)
    csv_io.write_csv('../data/five_0025_data.csv', five_0025_data)

    csv_io.write_csv('../data/one_003_data.csv', one_003_data)
    csv_io.write_csv('../data/three_003_data.csv', three_003_data)
    csv_io.write_csv('../data/five_003_data.csv', five_003_data)

    header.append('color')
    days7.insert(0, header)
    csv_io.write_csv('../data/seven_data.csv', days7)
