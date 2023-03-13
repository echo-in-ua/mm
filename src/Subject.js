class ObserverList {
  constructor() {
    this.observerList = [];
  }
  addOserverToList( obj ){
    return this.observerList.push( obj );
  }
  count(){
    return this.observerList.length;
  }
  getObserverFromList(index) {
    if( index > -1 && index < this.observerList.length ){
      return this.observerList[ index ];
    }
  }
  indexOfObserver(obj,startIndex) {
    let i = startIndex; 
    while( i < this.observerList.length ){
      if( this.observerList[i] === obj ){
        return i;
      }
      i++;
    } 
    return -1;
  }
  removeObserverFromList(index){
    this.observerList.splice( index, 1 );
  }
}

class Subject extends ObserverList {
  constructor(){
    super();
  }
  addObserver( observer ){
    this.addOserverToList(observer);
  }
  removeObserver( observer ) {
    this.removeObserverFromList(this.indexOfObserver(observer,0));
  }
  notify ( context, message ) {
    const observerCount = this.count();
    for (let i=0; i<observerCount; i++){
      this.getObserverFromList(i).update(context, message);
    }
  }
}

export { Subject }
