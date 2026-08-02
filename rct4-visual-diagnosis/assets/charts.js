(function(){
  var s=getComputedStyle(document.documentElement);
  var v=function(n){return s.getPropertyValue(n).trim();};
  var accent=v('--accent'), blue=v('--blue'), cyan=v('--cyan'), ink=v('--ink'),
      muted=v('--muted'), rule=v('--rule'), bg2=v('--bg2'), fatal=v('--fatal');

  var dims=['自发光辉光','体积光照','解剖几何','纤维密度/体积','方向编码DEC','空气纵深','色彩层次','终幕动效'];
  var now =[1,2,3,2,1,2,3,4];
  var goal=[9,8,9,9,9,8,8,8];

  var radar=echarts.init(document.getElementById('chart-radar'),null,{renderer:'svg'});
  radar.setOption({
    animation:false,
    backgroundColor:'transparent',
    tooltip:{appendToBody:true,trigger:'item'},
    legend:{data:['RCT4 现状','目标态（顶级范式）'],bottom:0,textStyle:{color:muted,fontFamily:v('--font-m'),fontSize:11},itemWidth:14,itemHeight:8},
    radar:{
      indicator:dims.map(function(d){return {name:d,max:10};}),
      shape:'polygon',
      radius:'66%',
      axisName:{color:muted,fontFamily:v('--font-b'),fontSize:11},
      splitLine:{lineStyle:{color:rule}},
      splitArea:{areaStyle:{color:['rgba(255,255,255,0.015)','rgba(255,255,255,0)']}},
      axisLine:{lineStyle:{color:rule}}
    },
    series:[{
      type:'radar',
      data:[
        {value:now,name:'RCT4 现状',lineStyle:{color:blue,width:2},areaStyle:{color:'rgba(91,141,239,0.18)'},itemStyle:{color:blue},symbol:'circle',symbolSize:5},
        {value:goal,name:'目标态（顶级范式）',lineStyle:{color:accent,width:2,type:'dashed'},areaStyle:{color:'rgba(245,158,11,0.10)'},itemStyle:{color:accent},symbol:'circle',symbolSize:5}
      ]
    }]
  });

  // bubble: [cost, benefit, leverage, id, phase]
  var pts=[
    [3,10,34,'RX-01','A'],[3,9,28,'RX-02','A'],[2,8,24,'RX-03','A'],
    [6,8,26,'RX-04','B'],[5,7,20,'RX-06','B'],[4,6,18,'RX-07','B'],
    [8,9,24,'RX-05','C'],[4,5,16,'RX-08','C']
  ];
  var phColor={A:accent,B:blue,C:cyan};
  var series=['A','B','C'].map(function(ph,idx){
    return {
      name:{A:'Phase A · 救命',B:'Phase B · 提质',C:'Phase C · 打磨'}[ph],
      type:'scatter',
      data:pts.filter(function(p){return p[4]===ph;}),
      symbolSize:function(d){return d[2];},
      itemStyle:{color:phColor[ph],opacity:0.82,borderColor:'#000',borderWidth:1,shadowBlur:12,shadowColor:phColor[ph]},
      label:{show:true,formatter:function(p){return p.data[3];},color:'#06101f',fontWeight:700,fontFamily:v('--font-m'),fontSize:10},
      emphasis:{focus:'series',itemStyle:{opacity:1}}
    };
  });

  var bubble=echarts.init(document.getElementById('chart-bubble'),null,{renderer:'svg'});
  bubble.setOption({
    animation:false,
    backgroundColor:'transparent',
    tooltip:{appendToBody:true,trigger:'item',formatter:function(p){return '<b style="color:'+phColor[p.data[4]]+'">'+p.data[3]+'</b><br/>实现成本 '+p.data[0]+' / 10<br/>视觉收益 '+p.data[1]+' / 10<br/>杠杆 '+p.data[2];}},
    legend:{data:['Phase A · 救命','Phase B · 提质','Phase C · 打磨'],bottom:0,textStyle:{color:muted,fontFamily:v('--font-m'),fontSize:11},itemWidth:12,itemHeight:12},
    grid:{left:54,right:24,top:24,bottom:54},
    xAxis:{name:'实现成本 →',nameLocation:'middle',nameGap:30,nameTextStyle:{color:muted,fontFamily:v('--font-m'),fontSize:11},min:0,max:10,splitLine:{lineStyle:{color:rule,type:'dashed'}},axisLine:{lineStyle:{color:rule}},axisLabel:{color:muted,fontFamily:v('--font-m')}},
    yAxis:{name:'视觉收益 →',nameLocation:'middle',nameGap:38,nameTextStyle:{color:muted,fontFamily:v('--font-m'),fontSize:11},min:3,max:11,splitLine:{lineStyle:{color:rule,type:'dashed'}},axisLine:{lineStyle:{color:rule}},axisLabel:{color:muted,fontFamily:v('--font-m')}},
    series:series.concat([{
      type:'scatter',data:[],markArea:{silent:true,data:[[{xAxis:0,yAxis:7,itemStyle:{color:'rgba(245,158,11,0.05)'}},{xAxis:4,yAxis:11}]],label:{show:true,position:'insideTopLeft',color:accent,fontFamily:v('--font-m'),fontSize:10,formatter:'先做这里\n低成本·高收益'}}}
    ])
  });

  window.addEventListener('resize',function(){radar.resize();bubble.resize();});
})();
