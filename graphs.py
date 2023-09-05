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
    fig.write_html("graph/unemployement_rate_us.html",config=config)
    
def cpi_usa(start_date='1990-01-01',end_date=dt.today()):
    """
    Function
    ---------- 
    Plot with plotly the consumer price index rate in the us
    https://fred.stlouisfed.org/series/CPALTT01USM659N
    
    Parameters
    ----------
    start_date: start date of you're plot
    end_date: end date of you're plot
    
    Returns
    ------
    plot the CPI in US
    """
    cpi=web.DataReader('CPALTT01USM659N','fred', start=start_date, end=end_date)
    core=web.DataReader('CPGRLE01CAM659N','fred', start=start_date, end=end_date)
    fig = go.Figure()
    fig.add_trace(go.Scatter(x=cpi.index, y=cpi['CPALTT01USM659N'],line_color='#00334E', name='IPC'))
    fig.add_trace(go.Scatter(x=core.index, y=core['CPGRLE01CAM659N'],line_color='#ED1C26', name='IPC de base'))
    fig.update_layout(title={'text': 'Indice des prix à la consommation','x': 0.5,'xanchor': 'center'},xaxis_title='Date',yaxis_title='IPC (%)',template="simple_white",
                      legend=dict(x=0, y=-0.2, orientation='h', bgcolor='rgba(255, 255, 255, 0)'))
    fig.write_html("graph/cpi_us.html",config=config)
    
def fedfunds_usa(start_date='2015-01-01',end_date=dt.today()):
    """
    Function
    ---------- 
    Plot with plotly the Federal Funds Effective Rate in the us
    https://fred.stlouisfed.org/series/FEDFUNDS
    
    Parameters
    ----------
    start_date: start date of you're plot
    end_date: end date of you're plot
    
    Returns
    ------
    plot the fedfunds in US
    """
    df=web.DataReader('FEDFUNDS','fred', start=start_date, end=end_date)
    df=df.rename(columns={'FEDFUNDS':'Taux effectif des fonds fédéraux'})
    fig = go.Figure(data=[go.Scatter(x=df.index, y=df['Taux effectif des fonds fédéraux'],line_color='#203864')])
    fig.update_layout(title={'text': 'Taux effectif des fonds fédéraux','x': 0.5,'xanchor': 'center'},xaxis_title='Date',yaxis_title='Taux effectif des fonds fédéraux (%)',template="simple_white")
    fig.write_html("graph/fedfunds_us.html",config=config)
    
def vix():
    df = yf.download('^VIX', '2019-1-1' , dt.today(), progress=False)
    df = df[['Adj Close']]
    fig=go.Figure()
    fig.add_trace(go.Scatter(x=df.index,y=df['Adj Close'],line_color='#00334E',name='VIX'))
    fig.update_layout(title={'text': "VIX",'x': 0.5,'xanchor': 'center'},xaxis_title='Date',template="simple_white",
                      legend=dict(x=0, y=-0.2, orientation='h', bgcolor='rgba(255, 255, 255, 0)'))
    fig.write_html("graph/vix.html",config=config)
    
    
def spreads_usa(start_date='2008-01-01',end_date=dt.today()):
    """
    Function
    ---------- 
    Plot with plotly the interest rate spread (10Y-2Y) in the us
    https://fred.stlouisfed.org/series/T10Y2Y
    
    Parameters
    ----------
    start_date: start date of you're plot
    end_date: end date of you're plot
    
    Returns
    ------
    plot interest rate spread (10Y-2Y) in US
    """
    df=web.DataReader('T10Y2Y','fred', start=start_date, end=end_date)
    df=df.rename(columns={'T10Y2Y':"interest rate spreads"})
    fig = go.Figure(data=[go.Scatter(x=df.index, y=df["interest rate spreads"],line_color='#203864')])
    fig.add_shape(type='line', x0=df.index[0], x1=df.index[-1], y0=0, y1=0,
    line=dict(color='#ED1C26', width=3, dash='dot'))
    fig.update_layout(title={'text': "Écarts de taux d'intérêt (10Y2Y)",'x': 0.5,'xanchor': 'center'},xaxis_title='Date',yaxis_title="interest rate spreads (%)",template="simple_white")
    fig.write_html("graph/spreads_us.html",config=config)

def savings_usa(start_date='2008-01-01',end_date=dt.today()):
    """
    Function
    ---------- 
    Plot with plotly the personal saving rate in the us
    https://fred.stlouisfed.org/series/PSAVERT
    
    Parameters
    ----------
    start_date: start date of you're plot
    end_date: end date of you're plot
    
    Returns
    ------
    plot the personnal saving rate in US
    """
    df=web.DataReader('PSAVERT','fred', start=start_date, end=end_date)
    df=df.rename(columns={'PSAVERT':"Taux d'épargne des particuliers"})
    fig = go.Figure(data=[go.Scatter(x=df.index, y=df["Taux d'épargne des particuliers"],line_color='#203864')])
    fig.update_layout(title={'text': "Taux d'épargne des particuliers",'x': 0.5,'xanchor': 'center'},xaxis_title='Date',yaxis_title="Taux d'épargne des particuliers (%)",template="simple_white")
    fig.write_html("graph/savings_us.html",config=config)
    
def moving_average(df, n,stock='XIU.TO'):
    """
    Function to calculate the moving average of a dataframe
    
    Parameters
    ----------
    df: dataframe
    n: window size
    
    Returns
    ------
    a new dataframe containing the moving average values
    """
    ma = df.rolling(n).mean()
    ma = ma.rename(columns={stock: 'MA' + str(n)})
    return ma

def sp_tsx(start_date='2019-01-01', end_date=dt.today()):
    """
    Function
    ---------- 
    Plot with plotly the ajd close price of XIU.TO
    
    
    Parameters
    ----------
    start_date: start date of you're plot
    end_date: end date of you're plot
    
    Returns
    ------
    plot S&P/TSX Composite Index
    """
    df = yf.download('^GSPTSE', start_date , end_date,progress=False)
    df = df[['Adj Close']]
    df = df.rename(columns={'Adj Close': '^GSPTSE'})

    # Create the figure
    fig = go.Figure()
    ma30 = moving_average(df, 30,stock='^GSPTSE')
    ma200 = moving_average(df, 200,stock='^GSPTSE')

    # Add the trace
    fig.add_trace(go.Scatter(x=df.index, y=df["^GSPTSE"], line_color='#00334E',name="^GSPTSE"))
    fig.add_trace(go.Scatter(x=ma30.index, y=ma30["MA30"], line_color='#ED1C26',name="MA30"))
    fig.add_trace(go.Scatter(x=ma200.index, y=ma200["MA200"], line_color='#5A9BD5',name="MA200"))

    

    # Update the layout
    fig.update_layout(
        #title={'text': "ETF d'actions canadiennes XIU",'x': 0.5,'xanchor': 'center'},
        xaxis_title='Date',
        yaxis_title="Prix ajusté",
        template="simple_white"
    )
    fig.write_html("graph/sp_tsx.html",config=config)

def sp_500(start_date='2019-01-01', end_date=dt.today()):
    """
    Function
    ---------- 
    Plot with plotly the ajd close price of XIU.TO
    
    
    Parameters
    ----------
    start_date: start date of you're plot
    end_date: end date of you're plot
    
    Returns
    ------
    plot S&P/TSX Composite Index
    """
    df = yf.download('^GSPC', start_date , end_date,progress=False)
    df = df[['Adj Close']]
    df = df.rename(columns={'Adj Close': '^GSPC'})

    # Create the figure
    fig = go.Figure()
    ma30 = moving_average(df, 30,stock='^GSPC')
    ma200 = moving_average(df, 200,stock='^GSPC')

    # Add the trace
    fig.add_trace(go.Scatter(x=df.index, y=df["^GSPC"], line_color='#00334E',name="^GSPC"))
    fig.add_trace(go.Scatter(x=ma30.index, y=ma30["MA30"], line_color='#ED1C26',name="MA30"))
    fig.add_trace(go.Scatter(x=ma200.index, y=ma200["MA200"], line_color='#5A9BD5',name="MA200"))

    

    # Update the layout
    fig.update_layout(
        #title={'text': "ETF d'actions canadiennes XIU",'x': 0.5,'xanchor': 'center'},
        xaxis_title='Date',
        yaxis_title="Prix ajusté",
        template="simple_white"
    )
    fig.write_html("graph/sp_500.html",config=config)