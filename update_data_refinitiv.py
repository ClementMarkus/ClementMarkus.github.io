import eikon as ek  # the Eikon Python wrapper package
import pandas as pd  # pandas

# Set the app key
ek.set_app_key('ed38bad70d5349ab8f74c842ba1fc15d1964a885')

# Get the data for different countries

# United States
# set the file path
file_path_us= r'C:\Users\cm12c\OneDrive\Documents\dashboard_data.xlsx'
# get the data

pmi_us= ek.get_timeseries('USPMI=ECI', start_date='2000-01-01', interval='monthly')
confidence_us= ek.get_timeseries('USCONC=ECI', start_date='2000-01-01', interval='monthly')
pe_us=ek.get_data(['.SPX'],['TR.Index_PE_RTRS.date','TR.Index_PE_RTRS'],{"SDate":'0D',"EDate":'-25CY'})
pe_us = pd.DataFrame(pe_us[0])


pmi_ca= ek.get_timeseries('CAIPMI=ECI', start_date='2000-01-01', interval='monthly')
confidence_ca= ek.get_timeseries('aCACONCF', start_date='2000-01-01', interval='monthly')
pe_cad = ek.get_data(['.SPTSE'],['TR.Index_PE_RTRS.date','TR.Index_PE_RTRS'],{"SDate":'0D',"EDate":'-25CY'})
pe_cad = pd.DataFrame(pe_cad[0])


pmi_china= ek.get_timeseries('CNCPMI=ECI', start_date='2000-01-01', interval='monthly')
confidence_china= ek.get_timeseries('aCNCONCF', start_date='2000-01-01', interval='monthly')
pe_china = ek.get_data(['.HSCE'],['TR.Index_PE_RTRS.date','TR.Index_PE_RTRS'],{"SDate":'0D',"EDate":'-25CY'})
pe_china = pd.DataFrame(pe_china[0])
export_china = ek.get_timeseries('CNEXP=ECI', start_date='2000-01-01', interval='monthly')

# write the file to excel
writer_us = pd.ExcelWriter(file_path_us, engine='xlsxwriter')
# Write each data set to a separate sheet

pmi_us.to_excel(writer_us, sheet_name='pmi_us')
confidence_us.to_excel(writer_us, sheet_name='confidence_us')
pe_us.to_excel(writer_us, sheet_name='pe_us')

pmi_ca.to_excel(writer_us, sheet_name='pmi_ca')
confidence_ca.to_excel(writer_us, sheet_name='confidence_ca')
pe_cad.to_excel(writer_us, sheet_name='pe_cad')

pmi_china.to_excel(writer_us, sheet_name='pmi_china')
confidence_china.to_excel(writer_us, sheet_name='confidence_china')
pe_china.to_excel(writer_us, sheet_name='pe_china')
export_china.to_excel(writer_us, sheet_name='export_china')


# Save the Excel file and close the Pandas Excel writer
writer_us.close()
