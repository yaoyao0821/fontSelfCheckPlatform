import $ from 'jquery';
const axios = require('axios');
import utils from '../utils/utils';
import '../../views/signinIcon.png';
import './templates/login.css';

$(function() {
   $("input#submit").on('click touchend', function() {
      var username = $("#txtUsername").val().trim();
      var password = $("#txtPwd").val().trim();
      axios.get('/login', {
         params: {
            username: username,
            password:password
         }
       }).then((res)=>{
         // save & update token
         localStorage.setItem('token', res.data.token);
         localStorage.setItem('username', res.data.username);
         window.location.href = '/dev.html';
      }).catch((err)=>{
         if (err && err.response && err.response.status == 400) {
            $('div.error').show();
         } else {
            throw err;
         }
      })
   })
})