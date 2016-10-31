#!/usr/bin/env python2.7
# -*- coding: utf-8 -*-
import requests
import csv
import sys
from datetime import datetime
from geopy.distance import vincenty
import json
def read_csv(file_name):
    data = [] 
    with open(file_name, 'r') as input_file:
        reader = csv.reader(input_file)
        for row in reader:
            data.append(row)
    return data[0] if len(data) == 1 else data

def write_csv(file_name, content):
    """write csv"""
    with open(file_name, 'w') as output_file:
        writer = csv.writer(output_file)
        writer.writerows(content)

def write_json(file_name, content):
    """write json"""
    with open(file_name, 'w') as output_file:
        json.dump(content, output_file)

def get_circle_data(input_data, prec):
    """get circle data"""
    circle = []
    count = 0
    for each in input_data:
        p1 = (each[-2], each[-1])
        for item in input_data:
            p2 = (item[-2], item[-1])
            dis = vincenty(p1, p2).meters
            if dis < 500:
                #print (dis, each[2], item[2])
                count += 1
        if count > len(input_data)*prec:
            #print (circle)
            tmp = each.copy()
            tmp.append(count)
            circle.append(tmp)
        count = 0
    return circle

if __name__ == '__main__':

    data = read_csv('../data/dengue_all.csv')
    header = None
    now = datetime.strptime(data[-1][1], '%Y/%m/%d').date()

    seven_data = []
    three_days = []
    five_days = []
    one_days = []

    for row in data:
        if not header:
            row[1] = '日期'
            row[2] = '區別'
            row[-2] = 'Latitude'
            row[-1] = 'Longitude'
            header = row
            continue

        event_date = datetime.strptime(row[1], '%Y/%m/%d').date()
        delta = (now-event_date)
        row[-1], row[-2] = float(row[-1]), float(row[-2])
        if delta.days < 7:
            tmp = row.copy()
            if delta.days < 3:
                three_days.append(row)
                tmp.append('red')
            else:
                tmp.append('cadetblue')
            if delta.days < 1:
                one_days.append(row)
            if delta.days < 5:
                five_days.append(row)

            seven_data.append(tmp)
    
    header += ['color']
    seven_data = [header] + seven_data
    write_csv('../data/seven_data.csv', seven_data)
    header.pop()

    data_header = header.copy() + ['count']
    one_0025_data = [data_header] + get_circle_data(one_days, 0.025)
    three_0025_data = [data_header] + get_circle_data(three_days, 0.025)
    five_0025_data = [data_header] + get_circle_data(five_days, 0.025)

    one_003_data = [data_header] + get_circle_data(one_days, 0.03)
    three_003_data = [data_header] + get_circle_data(three_days, 0.03)
    five_003_data = [data_header] + get_circle_data(five_days, 0.03)

    one_002_data = [data_header] + get_circle_data(one_days, 0.02)
    three_002_data = [data_header] + get_circle_data(three_days, 0.02)
    five_002_data = [data_header] + get_circle_data(five_days, 0.02)

    write_csv('../data/one_002_data.csv', one_002_data)
    write_csv('../data/three_002_data.csv', three_002_data)
    write_csv('../data/five_002_data.csv', five_002_data)

    write_csv('../data/one_0025_data.csv', one_0025_data)
    write_csv('../data/three_0025_data.csv', three_0025_data)
    write_csv('../data/five_0025_data.csv', five_0025_data)

    write_csv('../data/one_003_data.csv', one_003_data)
    write_csv('../data/three_003_data.csv', three_003_data)
    write_csv('../data/five_003_data.csv', five_003_data)
