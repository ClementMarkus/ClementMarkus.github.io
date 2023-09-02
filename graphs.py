import pandas as pd 
import pandas_datareader.data as web 
import yfinance as yf
from datetime import date as dt 
import plotly.graph_objs as go
import matplotlib.pyplot as plt
from dash import dash_table
from plotly.subplots import make_subplots

config = {
  'toImageButtonOptions': {
    'format': 'png', # one of png, svg, jpeg, webp
    'filename': 'custom_image',
    'height': 500,
    'width': 700,
    'scale': 7  }} # Multiply title/legend/axis/canvas sizes by this factor

def unrate_usa(start_date='1990-01-01',end_date=dt.today()):
    """
    Function
    ---------- 
    Plot with plotly the unemployment rate in the us
    https://fred.stlouisfed.org/series/UNRATE
    
    Parameters
    ----------
    start_date: start date of you're plot
    end_date: end date of you're plot
    
    Returns
    ------
    plot the unemployment rate in US
    """
    unrate=web.DataReader('UNRATE','fred', start=start_date, end=end_date)
    non_cyclic=web.DataReader('NROU','fred', start=start_date, end=end_date)
    fig=go.Figure()
    fig.add_trace(go.Scatter(x=unrate.index, y=unrate["UNRATE"], line_color='#00334E', name='Taux de chômage'))
    fig.add_trace(go.Scatter(x=non_cyclic.index, y=non_cyclic["NROU"], line_color='#ED1C26', name='taux de chômage non cyclique'))
    fig.update_layout(title={'text': 'Taux de chômage','x': 0.5,'xanchor': 'center'}
                      ,xaxis_title='Date',yaxis_title='Taux de chômage (%)',template="simple_white",
                      legend=dict(x=0, y=-0.2, orientation='h', bgcolor='rgba(255, 255, 255, 0)'))
    fig.write_html("unemployement_rate_us.html",config=config)