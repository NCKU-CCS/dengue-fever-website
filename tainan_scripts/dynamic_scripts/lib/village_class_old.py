#!/usr/bin/env python2.7
# -*- coding: utf-8 -*-
import requests
from datetime import datetime
from datetime import timedelta
from datetime import date
from geopy.distance import vincenty
from lib import json_io
from lib import csv_io

url = 'http://denguefever.csie.ncku.edu.tw/file/dengue_all.csv'
data = csv_io.req_csv(url, 'utf-8')

def create_village_data(village_rank, village_values, day15_value, todyday_value):
    village_data = {}
    three_quarters = round(len(village_rank) * 3 / 4)
    keys = village_rank
    for i in range(0, three_quarters):
        v = keys[i][0]
        if v not in village_data:
            village_data[v] = []
        if v not in day15_value:
            day15_value[v] = 0
        if v not in todyday_value:
            todyday_value[v] = 0

        cls = '-1'
        if todyday_value[v] >= day15_value[v]:
            cls = 'low-up'
        else:
            cls = 'low-down'

        village_data[v] = {\
                'value': village_values[v],
                'class': cls
                }

    for i in range(three_quarters, len(village_rank)):
        v = keys[i][0]

        if v not in village_data:
            village_data[v] = []
        if v not in day15_value:
            day15_value[v] = 0
        if v not in todyday_value:
            todyday_value[v] = 0

        cls = '-1'
        if todyday_value[v] >= day15_value[v]:
            cls = 'height-up'
        else:
            cls = 'height-down'

        village_data[v] = {\
                'value': village_values[v],
                'class': cls
                }
    return village_data

def add_up(key, data):
    if key not in data:
        data[key] = 0
    data[key] += 1

if __name__ == '__main__':
    # from 6m
    value = 0
    data = data[2000:]
    for item in data:
        item[1] = datetime.strptime(item[1], '%Y/%m/%d').date()

    data = sorted(data, key = lambda x: x[1])
    current_date = data[0][1]
    start_date = data[-1][1] - timedelta(days=14)

    day15_value = {}
    days_15ago = data[-1][1] - timedelta(days=15)
    end_date = data[-4][1]
    todyday_value = {}

    village_values = {}
    for item in data:
        key = item[2].replace('　', '') + item[3]
        print (key)
        if item[1] == days_15ago:
            add_up(key, day15_value)
        if item[1] < start_date:
            current_date = item[1]
            continue
        if item[1] == end_date:
            add_up(key, todyday_value)

        add_up(key, village_values)

    village_rank = sorted(village_values.items(), key=lambda x: x[1])
    village_data = create_village_data(village_rank, village_values, \
            day15_value, todyday_value)
    
    village_data['updateAt'] = end_date.strftime('%Y/%m/%d')
    json_io.write_json('../data/village_class.json', village_data)
