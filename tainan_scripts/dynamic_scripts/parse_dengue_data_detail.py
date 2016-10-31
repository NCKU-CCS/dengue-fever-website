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
    days1, days3, days5 = [], [], []
    for item in data:
        event_date = datetime.strptime(item[1], '%Y/%m/%d').date()
        if event_date > now:
            break
        if not item[-1]:
            continue
        delta = now - event_date
        item[-1], item[-2] = float(item[-1]), float(item[-2])
        if delta.days < 5:
            days5.append(item)
            if delta.days < 3:
                days3.append(item)
                if delta.days < 1:
                    days1.append(item)
    return days5, days3, days1

if __name__ == '__main__':
    url = 'http://denguefever.csie.ncku.edu.tw/file/dengue_all_v3.csv'
    data = csv_io.req_csv(url, 'utf-8')
    output_data = json_io.read_json('../data/dynamic/data.json')
    #output_data = {}

    header = data[0]
    data = data[1:]
    data = sorted(data, key = lambda x: datetime.strptime(x[1], '%Y/%m/%d').date())
    now = datetime.strptime(sys.argv[1], '%Y/%m/%d').date()
    end = datetime.strptime(data[-1][1], '%Y/%m/%d').date() + timedelta(days=1)
    while now < end:
        print (now)
        days5, days3, days1 = getDaysWithin(data)
        days1 = geo.get_hot_points(days1, 3, 50)
        days3 = geo.get_hot_points(days3, 3, 50)
        days5 = geo.get_hot_points(days5, 3, 50)
        days1.insert(0, header)
        days3.insert(0, header)
        days5.insert(0, header)
        output_data[now.strftime('%Y/%m/%d')] = {}
        output_data[now.strftime('%Y/%m/%d')]['one'] = days1
        output_data[now.strftime('%Y/%m/%d')]['three'] = days3
        output_data[now.strftime('%Y/%m/%d')]['five'] = days5
        now += timedelta(days=1)

    output_data['end'] = end.strftime('%Y/%m/%d')
    json_io.write_json('../data/dynamic/data.json', output_data)
