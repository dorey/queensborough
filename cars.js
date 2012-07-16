$(function(){
    var carTemp = _.template($('#veh-row').html());
    var summaryTemp = _.template($('#summary-row').html());

    var animateBox = function(svgWrap, t, h, w, color, boxWidth, boxDelta) {
        var r = Raphael(svgWrap.attr('id'));
        _.times(27, function(i){
            var xEnd = (i-1)*boxDelta;
            var xStart = i * boxDelta;
            var rect = r.rect(xStart, 0, boxWidth, h)
                .attr('stroke', 'none')
                .attr('fill', color);
            (function animateRect() {
                rect.attr({x: xStart});
                rect.animate({x: xEnd}, t, undefined, animateRect);
            })();
        });
    }

    var showScenario = function(scenarios, scenario, content) {
        $('#header').html(summaryTemp(scenario));
        var tolls = $('.bt .b').empty(),
            milliseconds = scenario.milliseconds;
        _.each(scenarios, function(s){
            if(scenario==s) {
                $('<span />', {text: s.name})
                    .appendTo(tolls);
            } else {
                $('<a />', {text: s.scenario, href: '#'})
                    .click(function(evt){
                        showScenario(scenarios, s, content);
                        evt.preventDefault();
                    })
                    .appendTo(tolls);
            }
        });
        var data = _.map(scenario.data, function(d){
            return _.extend({}, d, vehicles[d.vehtype], defaultVehicle);
        });
        var content = $('#content');
        content.empty();
        _.each(data, function(row){
                $(carTemp(row))
                    .addClass(row.vehtype)
                    .data(row)
                    .appendTo(content);
            });

        var visWidth = $('.veh-vis').eq(0).width();
        content.find('.vehicle-row').each(function(){
            var $this = $(this),
                data = $this.data(),
                pps = data.vehpixelspersecond,
                svgWrap = $this.find('.veh-svg'),
                carVis = $this.find('.veh-vis'),
                displayCount = data.vehdisplaycount,
                cars = carVis.children(),
                image = data.image,
                dims = data.dims,
                step = visWidth / displayCount;
            svgWrap.height(data.height);
            svgWrap.attr('id', _.uniqueId());
            _.times(Math.floor(visWidth / data.groupWidth), function(i){
                var elem = $('<div />', {'class': 'veh-group'})
                    .css({'height': data.height, width: data.groupWidth});
                _.times(data.vehspergroup, function(){
                    $('<div />', {'class':'vehicle'})
                        .css({width: dims.w,
                                height: dims.h,
                                'background-position': '-'+dims.l+'px 0px',
                                'background-image': 'url('+data.image+')'})
                        .appendTo(elem);
                });
                elem.prependTo(carVis)
            });
            animateBox(svgWrap, milliseconds, svgWrap.height(), svgWrap.width(), '#EFF0F4', 3, 30);
        });
    }
    
    $.ajax({
        url: 'data.json',
        dataType: 'jsonp',
        jsonpCallback: 'jsoncallback',
        crossDomain: true,
        success: function(d){
            showScenario(d, _.first(d), $('#content'));
        }
    });
})