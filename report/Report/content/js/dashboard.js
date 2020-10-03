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

    var data = {"OkPercent": 97.61243753470295, "KoPercent": 2.3875624652970573};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9659863945578231, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "transaction_openGuestbook"], "isController": true}, {"data": [0.939922480620155, 500, 1500, "serviceGuestbook"], "isController": false}, {"data": [1.0, 500, 1500, "JDBC Request (DELETE)"], "isController": false}, {"data": [0.8784313725490196, 500, 1500, "sendComment"], "isController": true}, {"data": [1.0, 500, 1500, "transaction_openGeneralSite"], "isController": true}, {"data": [1.0, 500, 1500, "openClients"], "isController": false}, {"data": [1.0, 500, 1500, "openGuestbook"], "isController": false}, {"data": [1.0, 500, 1500, "transaction_openClients"], "isController": true}, {"data": [1.0, 500, 1500, "clearGuestbookHistory"], "isController": true}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.8784313725490196, 500, 1500, "transaction_addGuestbook"], "isController": true}, {"data": [1.0, 500, 1500, "openGeneralSite"], "isController": false}, {"data": [0.9529411764705882, 500, 1500, "addGuestbook"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 1801, 43, 2.3875624652970573, 9.646862853970001, 0, 319, 8.0, 15.0, 27.0, 56.98000000000002, 5.998474568932497, 34.25502036059125, 2.042294309317786], "isController": false}, "titles": ["Label", "#Samples", "KO", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions\/s", "Received", "Sent"], "items": [{"data": ["transaction_openGuestbook", 258, 0, 0.0, 23.996124031007774, 11, 100, 17.0, 52.0, 63.04999999999998, 87.15000000000038, 0.8612229365699293, 6.370527268512955, 0.6173219096116486], "isController": true}, {"data": ["serviceGuestbook", 516, 31, 6.007751937984496, 13.096899224806208, 5, 100, 8.0, 32.0, 44.14999999999998, 64.82999999999998, 1.7259199052750935, 5.838189050944741, 0.5376645017409716], "isController": false}, {"data": ["JDBC Request (DELETE)", 3, 0, 0.0, 111.33333333333334, 6, 319, 9.0, 319.0, 319.0, 319.0, 0.016609640235192506, 1.6761030185252854E-4, 0.0], "isController": false}, {"data": ["sendComment", 255, 31, 12.156862745098039, 65.15294117647058, 39, 241, 58.0, 97.0, 108.0, 155.27999999999997, 0.8508622070364635, 33.36451575617459, 2.0310881172087716], "isController": true}, {"data": ["transaction_openGeneralSite", 260, 0, 0.0, 11.280769230769236, 0, 86, 9.0, 16.0, 19.0, 50.009999999999195, 0.8655501070285997, 19.074238633204832, 0.2997565432259052], "isController": true}, {"data": ["openClients", 255, 0, 0.0, 8.149019607843137, 5, 16, 8.0, 12.0, 13.199999999999989, 15.439999999999998, 0.8512428145091834, 5.100037200145546, 0.33334801622869387], "isController": false}, {"data": ["openGuestbook", 258, 0, 0.0, 8.383720930232556, 5, 36, 7.0, 12.0, 13.049999999999983, 25.050000000000125, 0.8624666546322483, 3.4637148181298514, 0.34953482585193657], "isController": false}, {"data": ["transaction_openClients", 255, 0, 0.0, 8.15294117647059, 5, 16, 8.0, 12.0, 13.199999999999989, 15.439999999999998, 0.8512428145091834, 5.100037200145546, 0.33334801622869387], "isController": true}, {"data": ["clearGuestbookHistory", 3, 0, 0.0, 233.33333333333334, 100, 485, 115.0, 485.0, 485.0, 485.0, 0.018627524029505998, 0.5985183550964907, 0.025631036482005813], "isController": true}, {"data": ["Debug Sampler", 255, 0, 0.0, 0.1450980392156862, 0, 3, 0.0, 1.0, 1.0, 1.4399999999999977, 0.8573907079021162, 0.5618549080574553, 0.0], "isController": false}, {"data": ["transaction_addGuestbook", 255, 31, 12.156862745098039, 22.305882352941186, 11, 109, 17.0, 42.0, 52.19999999999999, 90.11999999999995, 0.8538451493224487, 3.173582062471329, 0.7949634489400601], "isController": true}, {"data": ["openGeneralSite", 259, 0, 0.0, 11.320463320463324, 7, 86, 9.0, 16.0, 19.0, 50.59999999999866, 0.8643503856204133, 19.12134384897062, 0.30049681375084686], "isController": false}, {"data": ["addGuestbook", 255, 12, 4.705882352941177, 12.047058823529419, 6, 89, 8.0, 25.0, 34.19999999999999, 44.879999999999995, 0.8549931600547196, 0.2637866075380221, 0.5296818838684585], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain \\\/&lt;b&gt;Procter&amp;Gamble&lt;\\\/b&gt;: \'\\u0421\\u043F\\u0430\\u0441\\u0438\\u0431\\u043E!\'&lt;br&gt;\\\/", 4, 9.30232558139535, 0.2220988339811216], "isController": false}, {"data": ["Test failed: text expected to contain \\\/&lt;b&gt;\\u0426\\u0435\\u043D\\u0442\\u0440\\u0430\\u043B\\u044C\\u043D\\u044B\\u0439 \\u0431\\u0430\\u043D\\u043A \\u0420\\u043E\\u0441\\u0441\\u0438\\u0439\\u0441\\u043A\\u043E\\u0439 \\u0424\\u0435\\u0434\\u0435\\u0440\\u0430\\u0446\\u0438\\u0438&lt;\\\/b&gt;: \'\\u041E\\u0442\\u043B\\u0438\\u0447\\u043D\\u044B\\u0435 \\u0440\\u0435\\u0431\\u044F\\u0442\\u0430.\'&lt;br&gt;\\\/", 4, 9.30232558139535, 0.2220988339811216], "isController": false}, {"data": ["Test failed: text expected to contain \\\/&lt;b&gt;Procter&amp;Gamble&lt;\\\/b&gt;: \'\\u041E\\u0442\\u043B\\u0438\\u0447\\u043D\\u044B\\u0435 \\u0440\\u0435\\u0431\\u044F\\u0442\\u0430.\'&lt;br&gt;\\\/", 3, 6.976744186046512, 0.1665741254858412], "isController": false}, {"data": ["500", 12, 27.906976744186046, 0.6662965019433648], "isController": false}, {"data": ["Test failed: text expected to contain \\\/&lt;b&gt;\\u0426\\u0435\\u043D\\u0442\\u0440\\u0430\\u043B\\u044C\\u043D\\u044B\\u0439 \\u0431\\u0430\\u043D\\u043A \\u0420\\u043E\\u0441\\u0441\\u0438\\u0439\\u0441\\u043A\\u043E\\u0439 \\u0424\\u0435\\u0434\\u0435\\u0440\\u0430\\u0446\\u0438\\u0438&lt;\\\/b&gt;: \'\\u0420\\u0435\\u043A\\u043E\\u043C\\u0435\\u043D\\u0434\\u0443\\u044E, \\u044D\\u0442\\u043E \\u043B\\u0443\\u0447\\u0448\\u0430\\u044F \\u043A\\u043E\\u043C\\u043F\\u0430\\u043D\\u0438\\u044F \\u043D\\u0430 \\u0441\\u0432\\u0435\\u0442\\u0435\'&lt;br&gt;\\\/", 3, 6.976744186046512, 0.1665741254858412], "isController": false}, {"data": ["Test failed: text expected to contain \\\/&lt;b&gt;Procter&amp;Gamble&lt;\\\/b&gt;: \'\\u0420\\u0435\\u043A\\u043E\\u043C\\u0435\\u043D\\u0434\\u0443\\u044E, \\u044D\\u0442\\u043E \\u043B\\u0443\\u0447\\u0448\\u0430\\u044F \\u043A\\u043E\\u043C\\u043F\\u0430\\u043D\\u0438\\u044F \\u043D\\u0430 \\u0441\\u0432\\u0435\\u0442\\u0435\'&lt;br&gt;\\\/", 5, 11.627906976744185, 0.277623542476402], "isController": false}, {"data": ["Test failed: text expected to contain \\\/&lt;b&gt;Procter&amp;Gamble&lt;\\\/b&gt;: \'\\u0411\\u043B\\u0430\\u0433\\u043E\\u0434\\u0430\\u0440\\u044E \\u0437\\u0430 \\u043E\\u0442\\u043B\\u0438\\u0447\\u043D\\u0443\\u044E \\u0440\\u0430\\u0431\\u043E\\u0442\\u0443!\'&lt;br&gt;\\\/", 6, 13.953488372093023, 0.3331482509716824], "isController": false}, {"data": ["Test failed: text expected to contain \\\/&lt;b&gt;\\u0426\\u0435\\u043D\\u0442\\u0440\\u0430\\u043B\\u044C\\u043D\\u044B\\u0439 \\u0431\\u0430\\u043D\\u043A \\u0420\\u043E\\u0441\\u0441\\u0438\\u0439\\u0441\\u043A\\u043E\\u0439 \\u0424\\u0435\\u0434\\u0435\\u0440\\u0430\\u0446\\u0438\\u0438&lt;\\\/b&gt;: \'\\u0411\\u043B\\u0430\\u0433\\u043E\\u0434\\u0430\\u0440\\u044E \\u0437\\u0430 \\u043E\\u0442\\u043B\\u0438\\u0447\\u043D\\u0443\\u044E \\u0440\\u0430\\u0431\\u043E\\u0442\\u0443!\'&lt;br&gt;\\\/", 5, 11.627906976744185, 0.277623542476402], "isController": false}, {"data": ["Response was null", 1, 2.3255813953488373, 0.0555247084952804], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 1801, 43, "500", 12, "Test failed: text expected to contain \\\/&lt;b&gt;Procter&amp;Gamble&lt;\\\/b&gt;: \'\\u0411\\u043B\\u0430\\u0433\\u043E\\u0434\\u0430\\u0440\\u044E \\u0437\\u0430 \\u043E\\u0442\\u043B\\u0438\\u0447\\u043D\\u0443\\u044E \\u0440\\u0430\\u0431\\u043E\\u0442\\u0443!\'&lt;br&gt;\\\/", 6, "Test failed: text expected to contain \\\/&lt;b&gt;Procter&amp;Gamble&lt;\\\/b&gt;: \'\\u0420\\u0435\\u043A\\u043E\\u043C\\u0435\\u043D\\u0434\\u0443\\u044E, \\u044D\\u0442\\u043E \\u043B\\u0443\\u0447\\u0448\\u0430\\u044F \\u043A\\u043E\\u043C\\u043F\\u0430\\u043D\\u0438\\u044F \\u043D\\u0430 \\u0441\\u0432\\u0435\\u0442\\u0435\'&lt;br&gt;\\\/", 5, "Test failed: text expected to contain \\\/&lt;b&gt;\\u0426\\u0435\\u043D\\u0442\\u0440\\u0430\\u043B\\u044C\\u043D\\u044B\\u0439 \\u0431\\u0430\\u043D\\u043A \\u0420\\u043E\\u0441\\u0441\\u0438\\u0439\\u0441\\u043A\\u043E\\u0439 \\u0424\\u0435\\u0434\\u0435\\u0440\\u0430\\u0446\\u0438\\u0438&lt;\\\/b&gt;: \'\\u0411\\u043B\\u0430\\u0433\\u043E\\u0434\\u0430\\u0440\\u044E \\u0437\\u0430 \\u043E\\u0442\\u043B\\u0438\\u0447\\u043D\\u0443\\u044E \\u0440\\u0430\\u0431\\u043E\\u0442\\u0443!\'&lt;br&gt;\\\/", 5, "Test failed: text expected to contain \\\/&lt;b&gt;Procter&amp;Gamble&lt;\\\/b&gt;: \'\\u0421\\u043F\\u0430\\u0441\\u0438\\u0431\\u043E!\'&lt;br&gt;\\\/", 4], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": ["serviceGuestbook", 516, 31, "Test failed: text expected to contain \\\/&lt;b&gt;Procter&amp;Gamble&lt;\\\/b&gt;: \'\\u0411\\u043B\\u0430\\u0433\\u043E\\u0434\\u0430\\u0440\\u044E \\u0437\\u0430 \\u043E\\u0442\\u043B\\u0438\\u0447\\u043D\\u0443\\u044E \\u0440\\u0430\\u0431\\u043E\\u0442\\u0443!\'&lt;br&gt;\\\/", 6, "Test failed: text expected to contain \\\/&lt;b&gt;Procter&amp;Gamble&lt;\\\/b&gt;: \'\\u0420\\u0435\\u043A\\u043E\\u043C\\u0435\\u043D\\u0434\\u0443\\u044E, \\u044D\\u0442\\u043E \\u043B\\u0443\\u0447\\u0448\\u0430\\u044F \\u043A\\u043E\\u043C\\u043F\\u0430\\u043D\\u0438\\u044F \\u043D\\u0430 \\u0441\\u0432\\u0435\\u0442\\u0435\'&lt;br&gt;\\\/", 5, "Test failed: text expected to contain \\\/&lt;b&gt;\\u0426\\u0435\\u043D\\u0442\\u0440\\u0430\\u043B\\u044C\\u043D\\u044B\\u0439 \\u0431\\u0430\\u043D\\u043A \\u0420\\u043E\\u0441\\u0441\\u0438\\u0439\\u0441\\u043A\\u043E\\u0439 \\u0424\\u0435\\u0434\\u0435\\u0440\\u0430\\u0446\\u0438\\u0438&lt;\\\/b&gt;: \'\\u0411\\u043B\\u0430\\u0433\\u043E\\u0434\\u0430\\u0440\\u044E \\u0437\\u0430 \\u043E\\u0442\\u043B\\u0438\\u0447\\u043D\\u0443\\u044E \\u0440\\u0430\\u0431\\u043E\\u0442\\u0443!\'&lt;br&gt;\\\/", 5, "Test failed: text expected to contain \\\/&lt;b&gt;Procter&amp;Gamble&lt;\\\/b&gt;: \'\\u0421\\u043F\\u0430\\u0441\\u0438\\u0431\\u043E!\'&lt;br&gt;\\\/", 4, "Test failed: text expected to contain \\\/&lt;b&gt;\\u0426\\u0435\\u043D\\u0442\\u0440\\u0430\\u043B\\u044C\\u043D\\u044B\\u0439 \\u0431\\u0430\\u043D\\u043A \\u0420\\u043E\\u0441\\u0441\\u0438\\u0439\\u0441\\u043A\\u043E\\u0439 \\u0424\\u0435\\u0434\\u0435\\u0440\\u0430\\u0446\\u0438\\u0438&lt;\\\/b&gt;: \'\\u041E\\u0442\\u043B\\u0438\\u0447\\u043D\\u044B\\u0435 \\u0440\\u0435\\u0431\\u044F\\u0442\\u0430.\'&lt;br&gt;\\\/", 4], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["addGuestbook", 255, 12, "500", 12, null, null, null, null, null, null, null, null], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
