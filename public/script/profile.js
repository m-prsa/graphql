let jwt = sessionStorage.getItem('jwt');
document.getElementById('logoutButton').addEventListener('click', logout);

function logout() {
    sessionStorage.removeItem('jwt');
    window.location.href = '/';
}

let query = `
{
  user {
    id
    login
    firstName
    lastName
    auditRatio
    totalUp
    totalDown
    xps {
        amount
        originEventId
        path
    }
    progresses(
        where: {
          _and: {
            object:{type:{_eq:"exercise"}},
            isDone:{_eq:"true"}
          }
        }
      ){
        grade
      }
  }
  xp_total: transaction_aggregate(where: {type: {_eq: "xp"}, eventId: {_eq: 32}}) {
    aggregate {
      sum {
        amount
      }
    }
    
  }
}`;  // Ceci est la requête GraphQL que vous voulez faire

fetch('https://zone01normandie.org/api/graphql-engine/v1/graphql', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + jwt  // Incluez le JWT dans l'en-tête de la requête
    },
    body: JSON.stringify({
        query: query
    })
})
.then(response => {
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
})
.then(data => {
    // Ici vous pouvez faire quelque chose avec les données que vous avez obtenues
    console.log(data);
    let userInfo = data.data.user;
    document.getElementById('hello').innerHTML = `
        Hello ${userInfo[0].firstName} ${userInfo[0].lastName}
    `
    document.getElementById('userInfo').innerHTML = `
        <p>User ID: ${userInfo[0].id}</p>
        <p>Login: ${userInfo[0].login}</p>
    `;
    document.getElementById('userXP').innerHTML = `<p>Total XP: ${data.data.xp_total.aggregate.sum.amount}</p>`
    document.getElementById('userRatio').innerHTML = `<p>Ratio: ${userInfo[0].auditRatio}</p>`
    passFailRatio(userInfo[0].progresses)
    ratioGraph([userInfo[0].totalUp, userInfo[0].totalDown])
})
.catch(error => {
    console.error('There has been a problem with your fetch operation:', error);
});

function passFailRatio (pro) {
    let pass = 0;
    let fail = 0;
    for (const el of pro) {
        if (el.grade == 0) {
            fail += 1
        } else if (el.grade == 1) {
            pass += 1
        }
      }
      console.log(pass, fail)
      GraphCam([pass, fail])
}

function GraphCam(data) {
// Définition des données
let colors = ['green', 'red'];
let total = data.reduce((a, b) => a + b, 0);

// Création du diagramme circulaire
let startAngle = 0;
let svg = document.getElementById('pie');

for (let i = 0; i < data.length; i++) {
    // Calcul de l'angle de chaque segment
    let segmentAngle = (data[i] / total) * 360;

    // Calcul de l'angle de fin
    let endAngle = startAngle + segmentAngle;

    // Conversion en radians
    let start = {
        x: 100 + 100 * Math.cos(Math.PI * startAngle / 180),
        y: 100 + 100 * Math.sin(Math.PI * startAngle / 180)
    };
    let end = {
        x: 100 + 100 * Math.cos(Math.PI * endAngle / 180),
        y: 100 + 100 * Math.sin(Math.PI * endAngle / 180)
    };

    // Création de l'arc de cercle
    let largeArcFlag = segmentAngle <= 180 ? 0 : 1;
    let d = [
        'M', 100, 100,
        'L', start.x, start.y,
        'A', 100, 100, 0, largeArcFlag, 1, end.x, end.y,
        'Z'
    ];

    // Création de l'élément SVG
    let path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', d.join(' '));
    path.setAttribute('fill', colors[i]);

    // Ajout de l'élément au SVG
    svg.appendChild(path);

    // Mise à jour de l'angle de départ
    startAngle += segmentAngle;
}
    let legend = document.createElement('p')
    legend.innerHTML = `<span id="green"> ${data[0]} PASS </span>  <span id="red"> ${data[1]} FAIL</span> </br> RATIO : ${data[0] / data[1]}`
    document.getElementById('pieDiv').appendChild(legend)
}



function ratioGraph(dataR) {
    let data = [
        {category: 'Category 1', value1: dataR[0], value2: dataR[1]},
        // Plus de données...
    ];
    
    let svg = document.getElementById('barChart');
    let barWidth = 40;
    let barGap = 10;
    let maxVal = Math.max(...data.map(d => Math.max(d.value1, d.value2)));
    
    data.forEach((d, i) => {
        let group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.setAttribute('transform', `translate(${i * (barWidth * 2 + barGap * 3)}, 0)`);
        svg.appendChild(group);
    
        let bar1 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        bar1.setAttribute('x', 0);
        bar1.setAttribute('y', svg.height.baseVal.value - (d.value1 / maxVal * svg.height.baseVal.value));
        bar1.setAttribute('width', barWidth);
        bar1.setAttribute('height', d.value1 / maxVal * svg.height.baseVal.value);
        bar1.setAttribute('fill', 'green');
        group.appendChild(bar1);
    
        let bar2 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        bar2.setAttribute('x', barWidth + barGap);
        bar2.setAttribute('y', svg.height.baseVal.value - (d.value2 / maxVal * svg.height.baseVal.value));
        bar2.setAttribute('width', barWidth);
        bar2.setAttribute('height', d.value2 / maxVal * svg.height.baseVal.value);
        bar2.setAttribute('fill', 'red');
        group.appendChild(bar2);
    });
    let legend = document.createElement('p')
    legend.innerHTML = `<span id="green"> ${dataR[0]} ⬆️ </span>  <span id="red"> ${dataR[1]} ⬇️ </span> </br> RATIO : ${dataR[0] / dataR[1]}`
    document.getElementById('barDiv').appendChild(legend)
    
}
