const User = require('../../models/User');

module.exports = (app) => {

  app.post('/api/account/signup', (req, res, next) => {

    const { body } = req;
    const { password } = body;
    let { email } = body;

    email = email.toLowerCase();
    email = email.trim();

    if(!email){
      return res.send({
        success : false,
        message : 'Email cannot be blank!'
      });
    }

    if(!password){
      return res.send({
        success : false,
        message : 'Password cannot be blank!'
      });
    }

    User.find({
      email : email
    }, (err, previousUsers) => {
      if(err){
        return res.send({
          success : false,
          message : 'Server Error'
        });
      } else if (previousUsers.length > 0){
        return res.send({
          success : false,
          message : 'Account already exist.'
        });
      }

      const newUser = new User();

      newUser.email = email;
      newUser.password = newUser.generateHash(password);
      newUser.save((err, user) => {
        if(err){
          return res.send({
            success : false,
            message : 'Server error'
          });
        }
        return res.send({
          success : true,
          message : 'Signed up'
        });
      });

    });

  });

};