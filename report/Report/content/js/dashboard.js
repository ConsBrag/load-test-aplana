/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 97.6532432178729, "KoPercent": 2.3467567821271005};
    var dataset = [
        {
            "label" : "KO",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "OK",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9706650953064152, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.9997189432265318, 500, 1500, "transaction_openGuestbook"], "isController": true}, {"data": [0.9548650168728909, 500, 1500, "serviceGuestbook"], "isController": false}, {"data": [1.0, 500, 1500, "JDBC Request (DELETE)"], "isController": false}, {"data": [0.9086265607264472, 500, 1500, "sendComment"], "isController": true}, {"data": [0.9091940976163451, 500, 1500, "transaction_addGuestbook"], "isController": true}, {"data": [1.0, 500, 1500, "openGeneralSite"], "isController": false}, {"data": [1.0, 500, 1500, "transaction_openGeneralSite"], "isController": true}, {"data": [0.9489216799091941, 500, 1500, "addGuestbook"], "isController": false}, {"data": [1.0, 500, 1500, "openGuestbook"], "isController": false}, {"data": [1.0, 500, 1500, "openClients"], "isController": false}, {"data": [1.0, 500, 1500, "transaction_openClients"], "isController": true}, {"data": [0.9705882352941176, 500, 1500, "clearGuestbookHistory"], "isController": true}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 10653, 250, 2.3467567821271005, 12.73650614850279, 4, 540, 9.0, 20.0, 30.0, 100.0, 35.4738167069589, 254.9009580540349, 14.104922874501343], "isController": false}, "titles": ["Label", "#Samples", "KO", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions\/s", "Received", "Sent"], "items": [{"data": ["transaction_openGuestbook", 1779, 0, 0.0, 29.08150646430573, 8, 636, 18.0, 50.0, 97.0, 196.20000000000005, 5.926148003797532, 55.439895057795766, 4.247844369909559], "isController": true}, {"data": ["serviceGuestbook", 3556, 160, 4.499437570303712, 15.794431946006736, 4, 540, 9.0, 23.300000000000182, 53.0, 147.71999999999935, 11.845515293239794, 63.09804604481876, 3.6901556431088816], "isController": false}, {"data": ["JDBC Request (DELETE)", 15, 0, 0.0, 38.0, 6, 393, 12.0, 178.20000000000013, 393.0, 393.0, 0.053181682810261935, 5.50513513465602E-4, 0.0], "isController": false}, {"data": ["sendComment", 1762, 160, 9.080590238365494, 75.90181611804782, 25, 860, 60.0, 136.0, 181.8499999999999, 322.0, 5.86402907386946, 252.82787313400237, 14.021167793975225], "isController": true}, {"data": ["transaction_addGuestbook", 1762, 160, 9.080590238365494, 26.24233825198637, 8, 302, 19.0, 46.0, 71.0, 161.3699999999999, 5.870222115612059, 33.28015123338797, 5.488611218345944], "isController": true}, {"data": ["openGeneralSite", 1779, 0, 0.0, 11.503653738055078, 5, 128, 9.0, 20.0, 24.0, 40.80000000000018, 5.924608606168387, 131.0655968433309, 2.059727210738228], "isController": false}, {"data": ["transaction_openGeneralSite", 1781, 0, 0.0, 11.491297024143732, 0, 128, 9.0, 20.0, 24.0, 40.720000000000255, 5.926966198654868, 130.9705114660256, 2.058232921285496], "isController": true}, {"data": ["addGuestbook", 1762, 90, 5.107832009080591, 14.452326901248556, 4, 191, 9.0, 27.700000000000045, 46.0, 106.21999999999935, 5.870417692546035, 1.830968874000913, 3.6600213820885625], "isController": false}, {"data": ["openGuestbook", 1779, 0, 0.0, 9.315907813378288, 4, 144, 7.0, 16.0, 20.0, 32.200000000000045, 5.926266452135155, 23.800630602720286, 2.4017583765977433], "isController": false}, {"data": ["openClients", 1762, 0, 0.0, 9.332576617480129, 4, 73, 8.0, 16.0, 20.0, 31.0, 5.869752784135011, 35.16692708073076, 2.2986043617559955], "isController": false}, {"data": ["transaction_openClients", 1762, 0, 0.0, 9.334279228149823, 4, 73, 8.0, 16.0, 20.0, 31.0, 5.869733230285425, 35.16680992949324, 2.2985967044379447], "isController": true}, {"data": ["clearGuestbookHistory", 17, 0, 0.0, 114.29411764705881, 14, 547, 79.0, 280.5999999999998, 547.0, 547.0, 0.060167832860838884, 2.051295206614568, 0.08058438781884528], "isController": true}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain \\\/&lt;b&gt;Procter&amp;Gamble&lt;\\\/b&gt;: \'\\u0421\\u043F\\u0430\\u0441\\u0438\\u0431\\u043E!\'&lt;br&gt;\\\/", 17, 6.8, 0.15957946118464283], "isController": false}, {"data": ["Test failed: text expected to contain \\\/&lt;b&gt;\\u0426\\u0435\\u043D\\u0442\\u0440\\u0430\\u043B\\u044C\\u043D\\u044B\\u0439 \\u0431\\u0430\\u043D\\u043A \\u0420\\u043E\\u0441\\u0441\\u0438\\u0439\\u0441\\u043A\\u043E\\u0439 \\u0424\\u0435\\u0434\\u0435\\u0440\\u0430\\u0446\\u0438\\u0438&lt;\\\/b&gt;: \'\\u0421\\u043F\\u0430\\u0441\\u0438\\u0431\\u043E!\'&lt;br&gt;\\\/", 17, 6.8, 0.15957946118464283], "isController": false}, {"data": ["Test failed: text expected to contain \\\/&lt;b&gt;\\u0426\\u0435\\u043D\\u0442\\u0440\\u0430\\u043B\\u044C\\u043D\\u044B\\u0439 \\u0431\\u0430\\u043D\\u043A \\u0420\\u043E\\u0441\\u0441\\u0438\\u0439\\u0441\\u043A\\u043E\\u0439 \\u0424\\u0435\\u0434\\u0435\\u0440\\u0430\\u0446\\u0438\\u0438&lt;\\\/b&gt;: \'\\u041E\\u0442\\u043B\\u0438\\u0447\\u043D\\u044B\\u0435 \\u0440\\u0435\\u0431\\u044F\\u0442\\u0430.\'&lt;br&gt;\\\/", 20, 8.0, 0.18774054257016803], "isController": false}, {"data": ["500", 90, 36.0, 0.8448324415657561], "isController": false}, {"data": ["Test failed: text expected to contain \\\/&lt;b&gt;Procter&amp;Gamble&lt;\\\/b&gt;: \'\\u041E\\u0442\\u043B\\u0438\\u0447\\u043D\\u044B\\u0435 \\u0440\\u0435\\u0431\\u044F\\u0442\\u0430.\'&lt;br&gt;\\\/", 17, 6.8, 0.15957946118464283], "isController": false}, {"data": ["Test failed: text expected to contain \\\/&lt;b&gt;\\u0426\\u0435\\u043D\\u0442\\u0440\\u0430\\u043B\\u044C\\u043D\\u044B\\u0439 \\u0431\\u0430\\u043D\\u043A \\u0420\\u043E\\u0441\\u0441\\u0438\\u0439\\u0441\\u043A\\u043E\\u0439 \\u0424\\u0435\\u0434\\u0435\\u0440\\u0430\\u0446\\u0438\\u0438&lt;\\\/b&gt;: \'\\u0420\\u0435\\u043A\\u043E\\u043C\\u0435\\u043D\\u0434\\u0443\\u044E, \\u044D\\u0442\\u043E \\u043B\\u0443\\u0447\\u0448\\u0430\\u044F \\u043A\\u043E\\u043C\\u043F\\u0430\\u043D\\u0438\\u044F \\u043D\\u0430 \\u0441\\u0432\\u0435\\u0442\\u0435\'&lt;br&gt;\\\/", 29, 11.6, 0.27222378672674363], "isController": false}, {"data": ["Test failed: text expected to contain \\\/&lt;b&gt;Procter&amp;Gamble&lt;\\\/b&gt;: \'\\u0420\\u0435\\u043A\\u043E\\u043C\\u0435\\u043D\\u0434\\u0443\\u044E, \\u044D\\u0442\\u043E \\u043B\\u0443\\u0447\\u0448\\u0430\\u044F \\u043A\\u043E\\u043C\\u043F\\u0430\\u043D\\u0438\\u044F \\u043D\\u0430 \\u0441\\u0432\\u0435\\u0442\\u0435\'&lt;br&gt;\\\/", 17, 6.8, 0.15957946118464283], "isController": false}, {"data": ["Test failed: text expected to contain \\\/&lt;b&gt;Procter&amp;Gamble&lt;\\\/b&gt;: \'\\u0411\\u043B\\u0430\\u0433\\u043E\\u0434\\u0430\\u0440\\u044E \\u0437\\u0430 \\u043E\\u0442\\u043B\\u0438\\u0447\\u043D\\u0443\\u044E \\u0440\\u0430\\u0431\\u043E\\u0442\\u0443!\'&lt;br&gt;\\\/", 18, 7.2, 0.16896648831315123], "isController": false}, {"data": ["Test failed: text expected to contain \\\/&lt;b&gt;\\u0426\\u0435\\u043D\\u0442\\u0440\\u0430\\u043B\\u044C\\u043D\\u044B\\u0439 \\u0431\\u0430\\u043D\\u043A \\u0420\\u043E\\u0441\\u0441\\u0438\\u0439\\u0441\\u043A\\u043E\\u0439 \\u0424\\u0435\\u0434\\u0435\\u0440\\u0430\\u0446\\u0438\\u0438&lt;\\\/b&gt;: \'\\u0411\\u043B\\u0430\\u0433\\u043E\\u0434\\u0430\\u0440\\u044E \\u0437\\u0430 \\u043E\\u0442\\u043B\\u0438\\u0447\\u043D\\u0443\\u044E \\u0440\\u0430\\u0431\\u043E\\u0442\\u0443!\'&lt;br&gt;\\\/", 20, 8.0, 0.18774054257016803], "isController": false}, {"data": ["Response was null", 5, 2.0, 0.04693513564254201], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 10653, 250, "500", 90, "Test failed: text expected to contain \\\/&lt;b&gt;\\u0426\\u0435\\u043D\\u0442\\u0440\\u0430\\u043B\\u044C\\u043D\\u044B\\u0439 \\u0431\\u0430\\u043D\\u043A \\u0420\\u043E\\u0441\\u0441\\u0438\\u0439\\u0441\\u043A\\u043E\\u0439 \\u0424\\u0435\\u0434\\u0435\\u0440\\u0430\\u0446\\u0438\\u0438&lt;\\\/b&gt;: \'\\u0420\\u0435\\u043A\\u043E\\u043C\\u0435\\u043D\\u0434\\u0443\\u044E, \\u044D\\u0442\\u043E \\u043B\\u0443\\u0447\\u0448\\u0430\\u044F \\u043A\\u043E\\u043C\\u043F\\u0430\\u043D\\u0438\\u044F \\u043D\\u0430 \\u0441\\u0432\\u0435\\u0442\\u0435\'&lt;br&gt;\\\/", 29, "Test failed: text expected to contain \\\/&lt;b&gt;\\u0426\\u0435\\u043D\\u0442\\u0440\\u0430\\u043B\\u044C\\u043D\\u044B\\u0439 \\u0431\\u0430\\u043D\\u043A \\u0420\\u043E\\u0441\\u0441\\u0438\\u0439\\u0441\\u043A\\u043E\\u0439 \\u0424\\u0435\\u0434\\u0435\\u0440\\u0430\\u0446\\u0438\\u0438&lt;\\\/b&gt;: \'\\u041E\\u0442\\u043B\\u0438\\u0447\\u043D\\u044B\\u0435 \\u0440\\u0435\\u0431\\u044F\\u0442\\u0430.\'&lt;br&gt;\\\/", 20, "Test failed: text expected to contain \\\/&lt;b&gt;\\u0426\\u0435\\u043D\\u0442\\u0440\\u0430\\u043B\\u044C\\u043D\\u044B\\u0439 \\u0431\\u0430\\u043D\\u043A \\u0420\\u043E\\u0441\\u0441\\u0438\\u0439\\u0441\\u043A\\u043E\\u0439 \\u0424\\u0435\\u0434\\u0435\\u0440\\u0430\\u0446\\u0438\\u0438&lt;\\\/b&gt;: \'\\u0411\\u043B\\u0430\\u0433\\u043E\\u0434\\u0430\\u0440\\u044E \\u0437\\u0430 \\u043E\\u0442\\u043B\\u0438\\u0447\\u043D\\u0443\\u044E \\u0440\\u0430\\u0431\\u043E\\u0442\\u0443!\'&lt;br&gt;\\\/", 20, "Test failed: text expected to contain \\\/&lt;b&gt;Procter&amp;Gamble&lt;\\\/b&gt;: \'\\u0411\\u043B\\u0430\\u0433\\u043E\\u0434\\u0430\\u0440\\u044E \\u0437\\u0430 \\u043E\\u0442\\u043B\\u0438\\u0447\\u043D\\u0443\\u044E \\u0440\\u0430\\u0431\\u043E\\u0442\\u0443!\'&lt;br&gt;\\\/", 18], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": ["serviceGuestbook", 3556, 160, "Test failed: text expected to contain \\\/&lt;b&gt;\\u0426\\u0435\\u043D\\u0442\\u0440\\u0430\\u043B\\u044C\\u043D\\u044B\\u0439 \\u0431\\u0430\\u043D\\u043A \\u0420\\u043E\\u0441\\u0441\\u0438\\u0439\\u0441\\u043A\\u043E\\u0439 \\u0424\\u0435\\u0434\\u0435\\u0440\\u0430\\u0446\\u0438\\u0438&lt;\\\/b&gt;: \'\\u0420\\u0435\\u043A\\u043E\\u043C\\u0435\\u043D\\u0434\\u0443\\u044E, \\u044D\\u0442\\u043E \\u043B\\u0443\\u0447\\u0448\\u0430\\u044F \\u043A\\u043E\\u043C\\u043F\\u0430\\u043D\\u0438\\u044F \\u043D\\u0430 \\u0441\\u0432\\u0435\\u0442\\u0435\'&lt;br&gt;\\\/", 29, "Test failed: text expected to contain \\\/&lt;b&gt;\\u0426\\u0435\\u043D\\u0442\\u0440\\u0430\\u043B\\u044C\\u043D\\u044B\\u0439 \\u0431\\u0430\\u043D\\u043A \\u0420\\u043E\\u0441\\u0441\\u0438\\u0439\\u0441\\u043A\\u043E\\u0439 \\u0424\\u0435\\u0434\\u0435\\u0440\\u0430\\u0446\\u0438\\u0438&lt;\\\/b&gt;: \'\\u041E\\u0442\\u043B\\u0438\\u0447\\u043D\\u044B\\u0435 \\u0440\\u0435\\u0431\\u044F\\u0442\\u0430.\'&lt;br&gt;\\\/", 20, "Test failed: text expected to contain \\\/&lt;b&gt;\\u0426\\u0435\\u043D\\u0442\\u0440\\u0430\\u043B\\u044C\\u043D\\u044B\\u0439 \\u0431\\u0430\\u043D\\u043A \\u0420\\u043E\\u0441\\u0441\\u0438\\u0439\\u0441\\u043A\\u043E\\u0439 \\u0424\\u0435\\u0434\\u0435\\u0440\\u0430\\u0446\\u0438\\u0438&lt;\\\/b&gt;: \'\\u0411\\u043B\\u0430\\u0433\\u043E\\u0434\\u0430\\u0440\\u044E \\u0437\\u0430 \\u043E\\u0442\\u043B\\u0438\\u0447\\u043D\\u0443\\u044E \\u0440\\u0430\\u0431\\u043E\\u0442\\u0443!\'&lt;br&gt;\\\/", 20, "Test failed: text expected to contain \\\/&lt;b&gt;Procter&amp;Gamble&lt;\\\/b&gt;: \'\\u0411\\u043B\\u0430\\u0433\\u043E\\u0434\\u0430\\u0440\\u044E \\u0437\\u0430 \\u043E\\u0442\\u043B\\u0438\\u0447\\u043D\\u0443\\u044E \\u0440\\u0430\\u0431\\u043E\\u0442\\u0443!\'&lt;br&gt;\\\/", 18, "Test failed: text expected to contain \\\/&lt;b&gt;Procter&amp;Gamble&lt;\\\/b&gt;: \'\\u0421\\u043F\\u0430\\u0441\\u0438\\u0431\\u043E!\'&lt;br&gt;\\\/", 17], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["addGuestbook", 1762, 90, "500", 90, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
