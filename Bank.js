/*
 * Hold all of the resources we have
 */
Bank = function() 
{
    this.balance = 0;
    this.totalSpent = 0;
    this.totalEarned = 0;
    
    /* withdraw resources - return if success */
    this.withdraw = function(amount) {
        if (this.balance >= amount) {
            this.balance -= amount;
            this.totalSpent += amount;
            return true;
        }
        return false;
    }

    /* deposit resources */
    this.deposit = function(amount) {
        this.balance += amount;
        this.totalEarned += amount;
    }
}
