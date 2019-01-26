import { Observable } from "rxjs";

const currentTime = new Observable(observer => {
  observer.next(new Date());

  const timer = setInterval(() => {
    observer.next(new Date());
  }, 1000);

  return () => {
    clearInterval(timer);
  };
});

export default currentTime;
