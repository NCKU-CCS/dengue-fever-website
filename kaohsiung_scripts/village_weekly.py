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
village_list = []
village_hash = {}
village_table = []

def insert_to_village_table(village_values):
    for v in village_list:
        if v in village_values:
            village_table[village_hash[v]].append(village_values[v])
        else:
            village_table[village_hash[v]].append(0)

if __name__ == '__main__':

    '''for item in data:
        try:
            datetime.strptime(item[1], '%Y/%m/%d').date()
        except:
            del item[0]
            item.insert(-2, '')

    csv_io.write_csv('../data/dengue_all.csv', data)'''

    data = data[1:]
    for item in data:
        del item[0]
        try:
            item[0] = datetime.strptime(item[0], '%Y/%m/%d').date()
        except:
            del item[0]
            item.insert(-2, '')
            item[0] = datetime.strptime(item[0], '%Y/%m/%d').date()
    
    data = sorted(data, key = lambda x: x[0])
    data = data[20:]

    current_date = datetime.strptime('2015/10/01', '%Y/%m/%d').date()
    village_values = {}
    for item in data:
        if (not item[2]):
            continue
        key = item[1].replace('　', '') + item[2]
        if key not in village_list and ('區' not in item[2]):
            village_hash[key] = len(village_list)
            village_list.append(key)
            village_table.append([key])

    count = 0
    for item in data:
        key = item[1].replace('　', '') + item[2]
        if item[0] < current_date or ('區' in item[2]):
            continue

        if key not in village_values:
            village_values[key] = 0

        event_date = item[0]
        if current_date == event_date:
            village_values[key] += 1
        else:
            insert_to_village_table(village_values)
            village_values = {} 
            village_values[key] = 1
            current_date += timedelta(days=1)

        while current_date < event_date:
            current_date += timedelta(days=1)
            insert_to_village_table({})


    village_weekly = []
    start = datetime.strptime('2015/10/01', '%Y/%m/%d').date()
    insert_to_village_table(village_values)
    header = ['區別', '里別']
    isHeader = True
    for row in village_table:
        if (sum(row[1:])) == 0:
            continue
        r1, r2 = row[0].split('區')
        village_weekly.append([r1+'區', r2])
        for i in range(1, len(row), 7):
            if ((i+6) > len(row)):
                break

            w_sum = sum(row[i:i+7])
            village_weekly[len(village_weekly)-1].append(w_sum)
            if isHeader:
                end = start + timedelta(days=6)
                d = "'" + str(start.strftime('%m/%d')) +'-'+str(end.strftime('%m/%d')) + "'"
                header.append(d)
                start = end + timedelta(days=1)

        isHeader = False
    
    village_weekly.insert(0, header)
    csv_io.write_csv('../public/data/kao_village_dengue_table.csv', village_weekly)
    print ('done')
