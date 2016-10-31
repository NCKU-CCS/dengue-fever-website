#!/usr/bin/env python2.7
# -*- coding: utf-8 -*-
import requests
from datetime import datetime
from datetime import timedelta
from datetime import date
from geopy.distance import vincenty
from lib import json_io
from lib import csv_io

url = 'http://denguefever.csie.ncku.edu.tw/file/dengue_all_v3.csv'
data = csv_io.req_csv(url, 'utf-8')
weather_data = json_io.read_json('../data/dynamic/weather.json')
csv_output = [['日期', '區別', '里別', '病例數']]
village_list = []
village_hash = {}
village_table = []

def format_data(current_date, value):
    d = datetime.strptime(current_date, '%Y/%m/%d').date().strftime('%Y/%m/%d')
    try:
        return {\
            'date': current_date, \
            'value': value, \
            '氣溫': weather_data[d]['氣溫'], \
            '相對溼度': weather_data[d]['相對溼度'], \
            '降水量': weather_data[d]['降水量'] \
           }
    except:
        return {\
            'date': current_date, \
            'value': value, \
            '氣溫': '', \
            '相對溼度': '', \
            '降水量': '' \
           }

def insert_village_data(village_data, village_values, current_date):
    d = datetime.strptime(current_date, '%Y/%m/%d').date()
    rain, rain_day = 0, -1
    key = d.strftime('%Y/%m/%d')
    for i in range(0, 3): 
        if key in weather_data and int(weather_data[key]['降水量']) > 0:
            rain += weather_data[key]['降水量']
            rain_day = i + 1
        d -= timedelta(days=1)
    for v in village_values:
        if v not in village_data:
            village_data[v] = []
        village_data[v].append({\
                'date': current_date, \
                'value': village_values[v], \
                '降水量': rain, \
                'rain_day': rain_day\
                })
        a, b = v.split('區')
        csv_output.append([current_date, a+'區', b, village_values[v]])
        
def insert_to_village_table(village_values):
    for v in village_list:
        if v in village_values:
            village_table[village_hash[v]].append(village_values[v])
        else:
            village_table[village_hash[v]].append(0)


if __name__ == '__main__':

    data = data[20:]
    for item in data:
        del item[0]
        item[0] = datetime.strptime(item[0], '%Y/%m/%d').date().strftime('%Y/%m/%d')

    value = 0
    data = sorted(data, key = lambda x: datetime.strptime(x[0], '%Y/%m/%d').date())
    current_date = '2015/08/01'
    output_data = []
    village_data = {}
    village_values = {}

    for item in data:
        key = item[1].replace('　', '') + item[2]
        if item[2] and key not in village_list and ('區' not in item[2]):
            village_hash[key] = len(village_list)
            village_list.append(key)
            village_table.append([key])

    for item in data:
        key = item[1].replace('　', '') + item[2]
        if ('2015/07' in item[0]) or '區' in item[2] or not item[2]:
            continue

        if key not in village_values:
            village_values[key] = 0

        event_date = item[0]
        if current_date == event_date:
            value += 1
            village_values[key] += 1
        else:
            output_data.append(format_data(current_date, value))
            insert_village_data(village_data, village_values, current_date)
            insert_to_village_table(village_values)
            current_date = event_date
            value = 1
            village_values = {}
   
    output_data.append(format_data(current_date, value))
    insert_village_data(village_data, village_values, current_date)
    insert_to_village_table(village_values)

    json_io.write_json('../data/dynamic/village_bar_data.json', village_data)
    json_io.write_json('../data/dynamic/bar_data.json', output_data)
    print (output_data[-1], 'done.')

    csv_io.write_csv('../public/data/village_dengue_data.csv', csv_output)
    csv_io.write_csv('../public/data/village_dengue_table.csv', village_table)
