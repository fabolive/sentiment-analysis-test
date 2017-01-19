/**
 *  * Copyright 2014 IBM Corp. All Rights Reserved.
 *   *
 *    * Licensed under the Apache License, Version 2.0 (the "License");
 *     * you may not use this file except in compliance with the License.
 *      * You may obtain a copy of the License at
 *       *
 *        *      http://www.apache.org/licenses/LICENSE-2.0
 *         *
 *          * Unless required by applicable law or agreed to in writing, software
 *           * distributed under the License is distributed on an "AS IS" BASIS,
 *            * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *             * See the License for the specific language governing permissions and
 *              * limitations under the License.
 *               */

//
// Made changes to the original code to test MSF Azure Text Analytics API.
//

'use strict';

$(document).ready(function() {

  var widgetId = 'vizcontainer', // Must match the ID in index.jade
    widgetWidth = 700, widgetHeight = 700, // Default width and height
    personImageUrl = 'public/images/app.png'; // Can be blank

  // Jquery variables
  var $content = $('.content'),
    $loading = $('.loading'),
    $error = $('.error'),
    $errorMsg = $('.errorMsg'),
    $results = $('.results');

  /**
   * Clear the "textArea"
   */
  $('.clear-btn').click(function(){
    $content.val('');
    $('.clear-btn').blur();
    updateWordsCount();
  });

  /**
   * Update words count on change
   */
  $content.change(updateWordsCount);

  /**
   * Update words count on copy/past
   */
  $content.bind('paste', function(e) {
    setTimeout(updateWordsCount, 100);
  });

  /**
   * 1. Create the request
   * 2. Call the API
   * 3. Call the methods to display the results
   */
  $('.analysis-btn').click(function(){
    $('.analysis-btn').blur();
    $loading.show();
    $error.hide();
    $results.hide();

    $.ajax({
      type: 'POST',
      data: {
        text: $content.val()
      },
      url: '/',
      dataType: 'json',
      success: function(response) {
        $loading.hide();

        if (response.error) {
          showError(response.error);
        } else {
          $results.show();
          showTextSummary(response);
        }

      },
      error: function(xhr) {
        $loading.hide();
        var error;
        try {
          error = JSON.parse(xhr.responseText);
        } catch(e) {}
        showError(error.error || error);
      }
    });
  });

  /**
   * Display an error or a default message
   * @param  {String} error The error
   */
  function showError(error) {
    var defaultErrorMsg = 'Error processing the request, please try again later.';
    $error.show();
    $errorMsg.text(error || defaultErrorMsg);
  }

  
  /**
   * Construct a text representation of the results
   */
  function showTextSummary(data) {
    console.log('showTextSummary()');
    var div = $('.summary-div');
    div.empty();
    console.log(JSON.stringify(data));
    var res = '<p>'+JSON.stringify(data)+'</p>';
    $(res).appendTo(div)
    var bar = document.getElementById("myBar");
    var score = data.documents[0].score*100;
    if(score <= 50){
    	bar.style.backgroundColor = '#ff5733';
    }else{
    	bar.style.backgroundColor = '#4CAF50';
    }
    bar.style.width = score + '%';
    document.getElementById("label").innerHTML = score + '%';
    
  }

  /*var widget = {
    d3vis: d3vis,
    data: theProfile,
    loadingDiv: 'dummy',
    switchState: function() {
      console.log('[switchState]');
    },
    _layout: function() {
      console.log('[_layout]');
    },
    showTooltip: function() {
      console.log('[showTooltip]');
    },
    id: 'SystemUWidget',
    COLOR_PALLETTE: ['#1b6ba2', '#488436', '#d52829', '#F53B0C', '#972a6b', '#8c564b', '#dddddd'],
    expandAll: function() {
      this.vis.selectAll('g').each(function() {
        var g = d3.select(this);
        if (g.datum().parent && // Isn't the root g object.
          g.datum().parent.parent && // Isn't the feature trait.
          g.datum().parent.parent.parent) { // Isn't the feature dominant trait.
          g.attr('visibility', 'visible');
        }
      });
    },
    collapseAll: function() {
      this.vis.selectAll('g').each(function() {
        var g = d3.select(this);
        if (g.datum().parent !== null && // Isn't the root g object.
          g.datum().parent.parent !== null && // Isn't the feature trait.
          g.datum().parent.parent.parent !== null) { // Isn't the feature dominant trait.
          g.attr('visibility', 'hidden');
        }
      });
    },
    addPersonImage: function(url) {
      if (!this.vis || !url) {
        return;
      }
      var icon_defs = this.vis.append('defs');
      var width = this.dimW,
        height = this.dimH;

      // The flower had a radius of 640 / 1.9 = 336.84 in the original, now is 3.2.
      var radius = Math.min(width, height) / 16.58; // For 640 / 1.9 -> r = 65
      var scaled_w = radius * 2.46; // r = 65 -> w = 160

      var id = 'user_icon_' + this.id;
      icon_defs.append('pattern')
        .attr('id', id)
        .attr('height', 1)
        .attr('width', 1)
        .attr('patternUnits', 'objectBoundingBox')
        .append('image')
        .attr('width', scaled_w)
        .attr('height', scaled_w)
        .attr('x', radius - scaled_w / 2) // r = 65 -> x = -25
        .attr('y', radius - scaled_w / 2)
        .attr('xlink:href', url)
        .attr('opacity', 1.0)
        .on('dblclick.zoom', null);
      this.vis.append('circle')
        .attr('r', radius)
        .attr('stroke-width', 0)
        .attr('fill', 'url(#' + id + ')');
    }
  };

  widget.dimH = widgetHeight;
  widget.dimW = widgetWidth;
  widget.d3vis.attr('width', widget.dimW).attr('height', widget.dimH);
  widget.d3vis.attr('viewBox', "0 0 " + widget.dimW + ", " + widget.dimH);
  renderChart.call(widget);
  widget.expandAll.call(widget);
  if (personImageUrl)
    widget.addPersonImage.call(widget, personImageUrl);
}
*/
  function updateWordsCount() {
    var text = $content.val();
    var wordsCount = text.match(/\S+/g) ? text.match(/\S+/g).length : 0;
    $('.wordsCount').css('color',wordsCount < 100 ? 'red' : 'gray');
    $('.wordsCount').text(wordsCount + ' words');
  }
  $content.keyup(updateWordsCount);
  updateWordsCount();
});
