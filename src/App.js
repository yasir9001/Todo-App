import React, { Component } from 'react';
import firebase from './component/firebase';
import { BrowserRouter } from 'react-router-dom';
import {Route} from 'react-router-dom';
import deleteIcon from './x-button.png';
import editIcon from './edit.png';
import './App.css';
class Parent extends Component {

  constructor(props){
    super(props);
    this.state = {
      signup:true,
      signin:false,
      loginPassword:'',
      loginEmail:'',
      signupEmail:'',
      signupPassword:'',
      signupCnfrmPassword:'',
      showInput:false
    }
  }

  handleChange(e){
    this.setState({[e.target.name]:e.target.value})
  }
  
  switch(word){
    var signup,login;
    if(word === "signup"){signup = true;login = false;}
    else{login = true; signup = false;}
    return this.setState({login:login,signup:signup})
    
  }
  
  handleSingup(){
    firebase.auth().createUserWithEmailAndPassword(this.state.signupEmail, this.state.signupPassword)
    .then((e)=>{
      localStorage.setItem('uid', e.user.uid)
      window.location = 'home';

    })
    .catch((e)=>{
      alert(e)
    })
  }

  handleLogin(){
    firebase.auth().signInWithEmailAndPassword(this.state.loginEmail, this.state.loginPassword)
    .then((e)=>{
      localStorage.setItem('uid', e.user.uid)
      window.location = 'home';
    })
    .catch((e)=>{
      alert(e)
    })
  }
    
        render(){
          let choice = null;
          if(this.state.signup){
            choice=(
              <div>
                   
                  <div id="signup">
                    <input type="email"  onChange={this.handleChange.bind(this)} name='signupEmail' value={this.state.signupEmail} placeholder="Email"/>
                    <input type="password" onChange={this.handleChange.bind(this)} name='signupPassword'  value={this.state.signupPassword} placeholder="Password"/>
                    <input type="password" onChange={this.handleChange.bind(this)} name='signupCnfrmPassword' value={this.state.signupCnfrmPassword} placeholder="Confirm Password"/>
                  <button id="send" onClick={this.handleSingup.bind(this)}>Sign Up</button>
            </div>
                </div>
            
            );
          }
          else if(this.state.login){
            choice=(
              <div>
                              
              <div id="login">
                 <input type="email" onChange={this.handleChange.bind(this)} value={this.state.loginEmail} name='loginEmail' placeholder="Email"/>
                 <input type="password"  onChange={this.handleChange.bind(this)}  value={this.state.loginPassword} name="loginPassword" placeholder="Password"/>
                 <button id="send" onClick={this.handleLogin.bind(this)}>Login</button>
         </div>
             
               </div>
           
            );
          }

          return (
            <div id='space'>
                    <div id="buttons">
                      <p id="signupButton" onClick={this.switch.bind(this,'signup')} className={this.state.signup ? "yellow":"blue"}>Sign In</p>
                    <p id="loginButton" onClick={this.switch.bind(this,'signin')} className={this.state.login ? "yellow":"blue"}> Login</p>
                    </div>
                  {choice}
           </div>
      )
        }
}



class App extends Component {
  constructor(props){
    super(props);
    this.path = firebase.database().ref().child('todo');
    this.state ={
      text:'',
      tasks:[],
      newText:''
  }
  }

  edit(id,i){
    let arr = [...this.state.tasks]
    if(!arr[i].showInput){
      arr[i].showInput = true
      this.setState({tasks:arr})  
      return  
    }
    if(arr[i].showInput){
      if(!this.state.newText){
        arr[i].showInput = false
        this.setState({tasks:arr})  
        return
      }
      this.path.child(`todos/${localStorage.getItem('uid')}/${id}`).set({
        id:id,
        text:this.state.newText
      }).then(()=> this.setState({newText:''}))
    }
  }
    

  delete(id){
    this.path.child(`todos/${localStorage.getItem('uid')}/${id}`).remove()
  }

  changeHandler(e){
    this.setState({text:e.target.value})
  }

  clickHandler(){
    if(this.state.text==''||this.state.text==' '){
      return;
    }
    let pushKey = this.path.push().getKey();
    this.path.child(`todos/${localStorage.getItem('uid')}/${pushKey}`).set(
      {
        id:pushKey,
        text:this.state.text,
      }
    ).then(()=> this.setState({text:''}))
  }

  componentDidMount(){
    this.path.child(`todos/${localStorage.getItem('uid')}`).on('value', snap =>{ 
      let _data = [];
      for(let key in snap.val()){
        _data.unshift({
          ...snap.val()[key],
          showInput:false
        })
      }
      this.setState({tasks:_data})
    })
  }
  
  blurHandler(i){
    // alert('sd')
    // let arr = [...this.state.tasks]
    // arr[i].showInput = false
    // this.setState({tasks:arr, newText:''})
  }
  render() {
    let form = null;
    form = (
      <>
        <div className='command-wrap'>
          <div className='input-wrap'>
            <input type='text' value={this.state.text} onChange={this.changeHandler.bind(this)}/>
          </div>  

          <div className='button-wrap'>
            <input type='button' value = '+'
            onClick={()=>this.clickHandler()}
            />

          </div>
        </div>

        <div className='tasks'>
           {this.state.tasks.map((e,i)=>{
            return (
              <div className='task' key={i}>
                  {e.showInput ? <input autoFocus onBlur = {() => this.blurHandler(i)} style = {{border:'none', borderRadius:'5px', outline:'none', padding:'8px 5px'}} value = {this.state.newText} onChange = {(e)=> this.setState({newText:e.target.value})}/>: e.text } 
                <span  onClick={()=>{this.delete(e.id)}} style={{color:'red', float:'right', cursor:'pointer'}}><img style={{height:'25px'}} src={deleteIcon} /></span>
                <span  onClick={()=>{this.edit(e.id, i)}} style={{color:'red', float:'right', cursor:'pointer'}}><img style={{height:'25px'}} src={editIcon} /></span>
              </div>  
      )
    })}
        </div>
</>

    );


    return (
      <BrowserRouter>
        <div className="App">
          <div className='header'>
            <p style={{margin:'0px'}}> Todo App with firebase </p>
          </div>     
          <Route path='/home' render={()=> { return form}} />
          <Route path='/'  render={()=>{return <Parent />}} exact />
        </div>
      </BrowserRouter>
    );
  }
}

export default App;
