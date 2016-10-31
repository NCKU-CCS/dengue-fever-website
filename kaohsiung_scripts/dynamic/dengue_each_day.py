#!/usr/bin/env python2.7
# -*- coding: utf-8 -*-
import requests
import csv
from datetime import datetime
from datetime import timedelta
from datetime import date
from geopy.distance import vincenty
from lib import json_io
from lib import csv_io

if __name__ == '__main__':
    data = csv_io.read_csv('./2015_dengue.csv')
    data = data[1:]

    count = 0
    new_data = []
    current_date = data[0][0]
    for row in data:
        event_date = row[0]
        if current_date == event_date:
            count += 1
        else:
            new_data.append({'date': current_date, 'value': count})
            count = 1
            current_date = event_date

    new_data.append({'date': current_date, 'value': count})
    json_io.write_json('../../data/2015_kao_bar.json', new_data)
