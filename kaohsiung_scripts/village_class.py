#!/usr/bin/env python2.7
# -*- coding: utf-8 -*-
import requests
from datetime import datetime
from datetime import timedelta
from datetime import date
from geopy.distance import vincenty
from lib import json_io
from lib import csv_io

url = 'http://52.192.252.231/file/dengue_all.csv'
data = csv_io.req_csv(url, 'utf-8')

def create_village_data(village_rank, village_values, day_1_7_values, day_8_14_values):
    village_data = {}
    three_quarters = round(len(village_rank) * 3 / 4)
    keys = village_rank
    for i in range(0, three_quarters):
        v = keys[i][0]
        if v not in village_data:
            village_data[v] = []

        cls = '-1'
        if v not in day_1_7_values:
            day_1_7_values[v] = 0
        if v not in day_8_14_values:
            day_8_14_values[v] = 0

        if day_1_7_values[v] >= day_8_14_values[v]:
            cls = 'low-up'
        else:
            cls = 'low-down'

        village_data[v] = {\
                'value': village_values[v],
                'class': cls, \
                'day_1_7': day_1_7_values[v], \
                'day_8_14': day_8_14_values[v]
                }

    for i in range(three_quarters, len(village_rank)):
        v = keys[i][0]

        if v not in village_data:
            village_data[v] = []

        cls = '-1'
        if v not in day_1_7_values:
            day_1_7_values[v] = 0
        if v not in day_8_14_values:
            day_8_14_values[v] = 0

        if day_1_7_values[v] >= day_8_14_values[v]:
            cls = 'height-up'
        else:
            cls = 'height-down'

        village_data[v] = {\
                'value': village_values[v],
                'class': cls, \
                'day_1_7': day_1_7_values[v], \
                'day_8_14': day_8_14_values[v]
            }
    return village_data

def add_up(key, data):
    if key not in data:
        data[key] = 0
    data[key] += 1

if __name__ == '__main__':
    value = 0
    data = data[1:]
    for item in data:
        item[1] = datetime.strptime(item[1], '%Y/%m/%d').date()

    data = sorted(data, key = lambda x: x[1])
    data = data[20:]

    start_date = data[-1][1] - timedelta(days=13)
    days_7ago = data[-1][1] - timedelta(days=6)
    end_date = data[-1][1]

    day_1_7_values = {}
    day_8_14_values = {}

    village_values = {}
    count = 0
    print (start_date, days_7ago, end_date)
    for item in data:
        if item[1] < start_date or '區' in item[3]:
            continue

        key = item[2].replace('　', '') + item[3]
        if item[1] < days_7ago:
            add_up(key, day_8_14_values)
        else:
            add_up(key, day_1_7_values)

        add_up(key, village_values)

    village_rank = sorted(village_values.items(), key=lambda x: x[1])
    village_data = create_village_data(village_rank, village_values, \
            day_1_7_values, day_8_14_values)
    
    village_data['updateAt'] = end_date.strftime('%Y/%m/%d')
    json_io.write_json('../data/kao_village_class.json', village_data)
