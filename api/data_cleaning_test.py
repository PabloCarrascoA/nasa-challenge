import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler


def get_element(planetID:int, planetName:str, data:pd.DataFrame):
    data = pd.read_csv("RawDatasete/cleanedData.csv")
    index = data[(data['kepid'] == planetID) & (data['kepoi_name'] == planetName)].index
    data = data.drop(columns=["kepid","kepoi_name","koi_tce_delivname", "koi_pdisposition"])
    data = data.drop(columns=["koi_disposition"])
    scaler = StandardScaler()
    data = scaler.fit_transform(data)
    return data[index]



def show_data():
    data = pd.read_csv("RawDatasete/cleanedData.csv")
    print(data.head(10))



def get_planet_info(planetID:int, planetName:str):
    data = pd.read_csv("RawDatasete/cleanedData.csv")
    data = data[(data['kepid'] == planetID) & (data['kepoi_name'] == planetName)]
    info = {
        "name": data.iloc[0]["kepoi_name"],
        "koi_disposition": data.iloc[0]["koi_disposition"],
        "koi_prad": data.iloc[0]["koi_prad"],
        "koi_period": data.iloc[0]["koi_period"],
        "koi_teq": data.iloc[0]["koi_teq"],
        "koi_insol": data.iloc[0]["koi_insol"],
        "ra": data.iloc[0]["ra"]
    }
    return info


