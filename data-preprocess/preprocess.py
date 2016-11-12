import os
import csv
import re
import json
from collections import namedtuple, defaultdict
from recordclass import recordclass
from datetime import date
from loading_bar import *


from argparse import ArgumentParser
parser = ArgumentParser()
parser.add_argument('data_folder')
parser.add_argument('airline_codes')
parser.add_argument('airport_codes')
parser.add_argument('output_file')
args = parser.parse_args()

data_folder = os.path.abspath(args.data_folder)
airline_codes = os.path.abspath(args.airline_codes)
airport_codes = os.path.abspath(args.airport_codes)
output_file = os.path.abspath(args.output_file)


def load_airline_names():
    with open(airline_codes, 'r') as f:
        r = csv.reader(f)
        next(r)
        for row in r:
            code, airline_name = row
            yield code, airline_name
airline_names = dict(load_airline_names())

def load_airport_details():
    with open(airport_codes, 'r') as f:
        r = csv.reader(f)
        next(r)
        for row in r:
            code, airport_loc_str = row
            # TODO: define airport_loc as a dict with lat, lon from Google Maps
            airport_loc = (0.0, 0.0)
            yield code, airport_loc
airport_details = dict(load_airport_details())

def in_us(wac):
    return wac <= 93

DataKey = namedtuple('DataKey', ['airport', 'airline', 'month'])
DataValue = recordclass('DataValue', ['avg_arr_delay', 'flight_count'])
data_pts = defaultdict(lambda: DataValue(0, 0))

loading_bar_init(len(os.listdir(data_folder)))
for data_file_path in os.listdir(data_folder):
    with open(os.path.join(data_folder, data_file_path), 'r') as f:
        r = csv.reader(f)
        next(r)
        for row in r:
            row = row[:-1]
            if any(not v for v in row): continue
            FL_DATE, UNIQUE_CARRIER, ORIGIN_AIRPORT_ID, ORIGIN_WAC, DEST_AIRPORT_ID, DEST_WAC, DEP_DELAY, ARR_DELAY = row

            origin_loc = int(ORIGIN_WAC)

            dest_loc = int(DEST_WAC)

            if not in_us(origin_loc) or not in_us(dest_loc): continue

            m = re.match(r'(\d+)[/\-](\d+)[/\-](\d+)', FL_DATE)
            flight_date = date(int(m.group(1)), int(m.group(2)), int(m.group(3)))

            airline = str(UNIQUE_CARRIER)

            origin_airport = str(ORIGIN_AIRPORT_ID)

            dest_airport = str(DEST_AIRPORT_ID)

            dep_delay = float(DEP_DELAY)

            arr_delay = float(ARR_DELAY)

            key = DataKey(airport_details[dest_airport], airline_names[airline], flight_date.month)
            value = data_pts[key]
            value.flight_count += 1
            value.avg_arr_delay += arr_delay
    loading_bar_update()
loading_bar_finish()

print('Creating JSON data...')

json_data = list()

loading_bar_init(len(data_pts))
for key, value in data_pts.items():
    value.avg_arr_delay /= value.flight_count
    json_object = {**key._asdict(), **value._asdict()}
    json_object['airport'] = {'lat': json_object['airport'][0], 'lon': json_object['airport'][1]}
    json_data.append(json_object)
    loading_bar_update()
loading_bar_finish()

print('Writing JSON data...')

with open(args.output_file, 'w') as f:
    json.dump(json_data, f)
