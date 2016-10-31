#!/usr/bin/env python2.7
# -*- coding: utf-8 -*-
import requests
import csv
from datetime import datetime
from datetime import timedelta
from datetime import date
from geopy.distance import vincenty
import json
from lib import csv_io
from lib import json_io
import subprocess
from firebase import firebase


def get_circle_data(input_data):
    """get circle data"""
    circle = []
    count = 0
    for each in input_data:
        p1 = (each[-2], each[-1])
        for item in input_data:
            p2 = (item[-2], item[-1])
            dis = vincenty(p1, p2).meters
            if dis < 500:
                count += 1
            if count > len(input_data)*0.03:
                break
        if count > len(input_data)*0.03:
            tmp = each.copy()
            tmp.append(count)
            circle.append(tmp)
        count = 0
    return circle

if __name__ == '__main__':
    new_data = json_io.read_json('../../data/2015_kao_data.json')
    data = csv_io.read_csv('./2015_dengue.csv')
    now = datetime.strptime(new_data['end'], '%Y/%m/%d').date()
    end = datetime.strptime(data[-1][0], '%Y/%m/%d').date() + timedelta(days=1)
    row = data[0]
    header = row
    header.append('count')
    #new_data = {}
    data = data[1:]
    while now < end:
        in_three_days = []
        in_five_days = []
        for row in data:
            event_date = datetime.strptime(row[0], '%Y/%m/%d').date()
            if event_date > now:
                break
            delta = now-event_date
            if not row[-1]:
                continue
            row[-1], row[-2] = float(row[-1]), float(row[-2])
            if delta.days < 3:
                in_three_days.append(row)
            if delta.days < 5:
                in_five_days.append(row)
               
        new_data[now.strftime('%Y/%m/%d')] = {}
        three_cirlce = get_circle_data(in_three_days)
        five_cirlce = get_circle_data(in_five_days)
        three_cirlce = [header] + three_cirlce
        five_cirlce = [header] + five_cirlce
        new_data[now.strftime('%Y/%m/%d')]['three'] = three_cirlce
        new_data[now.strftime('%Y/%m/%d')]['five'] = five_cirlce
        now += timedelta(days=1)
        print (now)
    new_data['end'] = end.strftime('%Y/%m/%d')
    json_io.write_json('../../data/2015_kao_data.json', new_data)
    taiwanstat_firebase = firebase.FirebaseApplication('https://realtaiwanstat2.firebaseio.com', None)

    with open('../../data/2015_kao_bar.json', 'r') as outfile:
        uv_data = outfile.read()
    result = taiwanstat_firebase.post('/dengue-kao2', uv_data)
    print (result)

    with open('../../data/2015_kao_data.json', 'r') as outfile:
        uv_data = outfile.read()
    result = taiwanstat_firebase.post('/dengue-kao1', uv_data)
    print (result)

