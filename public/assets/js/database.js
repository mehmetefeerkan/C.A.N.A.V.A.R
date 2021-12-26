  /**
 * Pretty Print JSON Objects.
 * Inspired by http://jsfiddle.net/unLSJ/
 *
 * @return {string}    html string of the formatted JS object
 * @example:  var obj = {"foo":"bar"};  obj.prettyPrint();
 */

   $(".loading").show(50)
   $(".wrapper").hide(50)
   
   window.pageAuthLoadedHandler = async function () {
    post("mgmt/database", {
        headers: {
            accesskey: "foobar"
        }
    }).then(res => {
        console.log(res);
        Object.prototype.prettyPrint = function () {
          var jsonLine = /^( *)("[\w]+": )?("[^"]*"|[\w.+-]*)?([,[{])?$/mg;
          var replacer = function (match, pIndent, pKey, pVal, pEnd) {
            var key = '<span class="json-key" style="color: brown">',
              val = '<span class="json-value" style="color: navy">',
              str = '<span class="json-string" style="color: olive">',
              r = pIndent || '';
            if (pKey)
              r = r + key + pKey.replace(/[": ]/g, '') + '</span>: ';
            if (pVal)
              r = r + (pVal[0] == '"' ? str : val) + pVal + '</span>';
            return r + (pEnd || '');
          };
      
          return JSON.stringify(this, null, 3)
            .replace(/&/g, '&amp;').replace(/\\"/g, '&quot;')
            .replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(jsonLine, replacer);
        }
      
      
        var account = res
      
        document.getElementById('acct').innerHTML = account.prettyPrint();
        $(".loading").hide()
        $(".wrapper").show()
    })
   }


  



