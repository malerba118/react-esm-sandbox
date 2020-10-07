import React from 'react'
import classes from './spinner.module.css'

export const Spinner = () => (
  <div className={classes.spinner}>
    <div className={classes.doubleBounce1}></div>
    <div className={classes.doubleBounce2}></div>
  </div>
)
